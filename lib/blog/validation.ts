import type { BlogBlock, BlogImage, BlogPostFields, BlogValidationIssue, BlogVideo, PostQuery, PostUpdate } from "./types.ts";
import { BlogError, invalid } from "./errors.ts";

export const BLOG_IMAGE_FILENAME = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(?:avif|webp|png|jpe?g)$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BLOCK_ID = /^[a-z][a-z0-9-]{0,79}$/;

export function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function onlyKeys(value: Record<string, unknown>, keys: readonly string[], label: string) {
  if (Object.keys(value).some(key => !keys.includes(key))) invalid(`${label} contains an unknown or read-only field.`);
}

function text(value: unknown, label: string, max: number, required = false): string {
  if (typeof value !== "string") invalid(`${label} must be a string.`);
  const result = value.trim();
  if (result.length > max || (required && !result)) invalid(`${label} must contain ${required ? "1" : "0"}–${max} characters.`);
  return result;
}

export function parsePostId(value: string): string {
  if (!UUID.test(value)) invalid("Post id must be a UUID.");
  return value;
}

export function parseSlug(value: unknown): string {
  const slug = text(value, "slug", 160, true);
  if (!SLUG.test(slug)) invalid("slug must use lowercase letters, numbers and single hyphens.");
  return slug;
}

function slugFromTitle(title: string): string {
  return parseSlug(title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 160).replace(/-$/g, ""));
}

export function parseImage(value: unknown, expectedType: BlogImage["type"]): BlogImage {
  const image = record(value, "image");
  onlyKeys(image, ["id", "url", "alt", "type"], "image");
  const id = text(image.id, "image.id", 36, true);
  const url = text(image.url, "image.url", 200, true);
  const filename = url.slice("/uploads/blog/".length);
  if (!UUID.test(id) || !url.startsWith("/uploads/blog/") || !BLOG_IMAGE_FILENAME.test(filename) || !filename.startsWith(`${id}.`)) {
    invalid("image must reference /uploads/blog/<image-id>.<jpg|jpeg|png|webp|avif> with a matching UUID.");
  }
  if (image.type !== expectedType) invalid(`image.type must be ${expectedType}.`);
  return { id, url, alt: text(image.alt, "image.alt", 300, true), type: expectedType };
}

function parseVideo(value: unknown): BlogVideo {
  const video = record(value, "video");
  onlyKeys(video, ["provider", "id", "title"], "video");
  if (video.provider !== "youtube" && video.provider !== "vimeo") invalid("video.provider must be youtube or vimeo.");
  const id = text(video.id, "video.id", 32, true);
  if (!(video.provider === "youtube" ? /^[A-Za-z0-9_-]{11}$/.test(id) : /^[0-9]{1,12}$/.test(id))) invalid("video.id is invalid for the selected provider.");
  return { provider: video.provider, id, title: text(video.title, "video.title", 240, true) };
}

function ctaHref(value: unknown): string {
  const href = text(value, "cta.href", 1000, true);
  // Only site paths or HTTPS. No javascript:, data:, protocol-relative URLs or backslashes.
  if (href.startsWith("/") && !href.startsWith("//") && !/[\\\s\u0000-\u001f]/.test(href)) return href;
  try {
    const url = new URL(href);
    if (url.protocol === "https:" && !url.username && !url.password && !/[\\\s\u0000-\u001f]/.test(href)) return url.toString();
  } catch { /* Rejected below. */ }
  return invalid("cta.href must be a site path or an HTTPS URL.");
}

export function parseBlocks(value: unknown): BlogBlock[] {
  if (!Array.isArray(value) || value.length > 80) invalid("blocks must be an ordered array with at most 80 items.");
  const ids = new Set<string>();
  return value.map((raw): BlogBlock => {
    const block = record(raw, "block");
    const id = text(block.id, "block.id", 80, true);
    if (!BLOCK_ID.test(id) || ids.has(id)) invalid("Block ids must be unique lowercase editorial slot names.");
    ids.add(id);
    switch (block.type) {
      case "text":
        onlyKeys(block, ["id", "type", "content"], "text block");
        return { id, type: "text", content: text(block.content, "text.content", 50000) };
      case "heading":
        onlyKeys(block, ["id", "type", "content", "level"], "heading block");
        if (block.level !== 2 && block.level !== 3) invalid("Heading level must be 2 or 3.");
        return { id, type: "heading", level: block.level, content: text(block.content, "heading.content", 240) };
      case "cta":
        onlyKeys(block, ["id", "type", "text", "label", "href"], "cta block");
        return { id, type: "cta", text: text(block.text, "cta.text", 1000), label: text(block.label, "cta.label", 100, true), href: ctaHref(block.href) };
      case "image":
        onlyKeys(block, ["id", "type", "image", "caption"], "image block");
        return { id, type: "image", image: block.image === null ? null : parseImage(block.image, "internal"), ...(block.caption === undefined ? {} : { caption: text(block.caption, "image.caption", 500) }) };
      case "video":
        onlyKeys(block, ["id", "type"], "video block");
        return { id, type: "video" };
      case "form":
        onlyKeys(block, ["id", "type", "formId"], "form block");
        if (block.formId !== "assessment") invalid("Only the existing assessment form is supported.");
        return { id, type: "form", formId: "assessment" };
      default:
        return invalid("Unsupported block type.");
    }
  });
}

const textFields = { title: 240, subtitle: 500, seoTitle: 240, metaDescription: 500, focusKeyword: 200, excerpt: 1000 } as const;
const mutableFields = [...Object.keys(textFields), "slug", "featuredImage", "blocks", "video", "tags"];

function parseFields(input: Record<string, unknown>): Partial<BlogPostFields> {
  const fields: Partial<BlogPostFields> = {};
  for (const [key, max] of Object.entries(textFields)) {
    const field = key as keyof typeof textFields;
    if (Object.hasOwn(input, field)) fields[field] = text(input[field], field, max, field === "title");
  }
  if (Object.hasOwn(input, "slug")) fields.slug = parseSlug(input.slug);
  if (Object.hasOwn(input, "featuredImage")) fields.featuredImage = input.featuredImage === null ? null : parseImage(input.featuredImage, "featured");
  if (Object.hasOwn(input, "video")) fields.video = input.video === null ? null : parseVideo(input.video);
  if (Object.hasOwn(input, "blocks")) fields.blocks = parseBlocks(input.blocks);
  if (Object.hasOwn(input, "tags")) {
    if (!Array.isArray(input.tags) || input.tags.length > 20) invalid("tags must be an array with at most 20 items.");
    const seen = new Set<string>();
    fields.tags = input.tags.map(tag => text(tag, "tag", 48, true)).filter(tag => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return fields;
}

// Reuse write-time parsers for saved data without normalizing or persisting it.
export function collectPostFieldIssues(post: BlogPostFields): BlogValidationIssue[] {
  const issues: BlogValidationIssue[] = [];
  for (const key of mutableFields) {
    try { parseFields({ [key]: post[key as keyof BlogPostFields] }); }
    catch (error) {
      if (!(error instanceof BlogError) || error.status !== 400) throw error;
      if (key === "blocks" && Array.isArray(post.blocks)) {
        const before = issues.length;
        for (const [index, block] of post.blocks.entries()) {
          try { parseBlocks([block]); }
          catch (blockError) {
            if (!(blockError instanceof BlogError) || blockError.status !== 400) throw blockError;
            issues.push({ code: "invalid_field", field: `blocks.${index}`, message: blockError.message });
          }
        }
        if (issues.length > before) continue;
      }
      issues.push({ code: "invalid_field", field: key, message: error.message });
    }
  }
  return issues;
}

export function parseCreateDraft(value: unknown): BlogPostFields {
  const input = record(value, "post");
  onlyKeys(input, mutableFields, "post");
  const fields = parseFields(input);
  if (!fields.title) invalid("title is required to create a draft.");
  return {
    subtitle: "", seoTitle: "", metaDescription: "", focusKeyword: "", excerpt: "",
    featuredImage: null, blocks: [], video: null, tags: [],
    ...fields, title: fields.title, slug: fields.slug ?? slugFromTitle(fields.title),
  };
}

export function parseRevision(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) invalid("revision must be a positive integer matching the current post revision.");
  return value;
}

export function parseUpdatePost(value: unknown): PostUpdate {
  const input = record(value, "post update");
  onlyKeys(input, [...mutableFields, "revision", "status"], "post update");
  if (input.status !== undefined && input.status !== "draft") invalid("Only the dedicated publish endpoint may set published status.");
  const changes = parseFields(input);
  if (!Object.keys(changes).length && input.status === undefined) invalid("The update contains no changes.");
  return { revision: parseRevision(input.revision), changes, ...(input.status === "draft" ? { status: "draft" } : {}) };
}

export function parsePublishRequest(value: unknown): number {
  const input = record(value, "publish request");
  onlyKeys(input, ["revision"], "publish request");
  return parseRevision(input.revision);
}

export function parseValidateRequest(value: unknown): number | undefined {
  const input = record(value, "validation request");
  onlyKeys(input, ["revision"], "validation request");
  return input.revision === undefined ? undefined : parseRevision(input.revision);
}

export function parsePreviewQuery(search: URLSearchParams): number | undefined {
  if ([...search.keys()].some(key => key !== "revision") || search.getAll("revision").length > 1) invalid("Only one optional revision query parameter is accepted.");
  const value = search.get("revision");
  if (value === null) return undefined;
  if (!/^[1-9][0-9]*$/.test(value)) invalid("revision must be a positive integer.");
  return parseRevision(Number(value));
}

export function parsePostQuery(search: URLSearchParams): PostQuery {
  if ([...search.keys()].some(key => !["page", "pageSize", "status"].includes(key))) invalid("Unknown query parameter.");
  function integer(key: string, fallback: number, max: number) {
    const value = search.get(key);
    if (value === null) return fallback;
    if (!/^[1-9][0-9]*$/.test(value) || Number(value) > max) invalid(`${key} must be an integer from 1 to ${max}.`);
    return Number(value);
  }
  const status = search.get("status");
  if (status !== null && status !== "draft" && status !== "published") invalid("status must be draft or published.");
  return { page: integer("page", 1, 10000), pageSize: integer("pageSize", 20, 100), ...(status ? { status } : {}) };
}
