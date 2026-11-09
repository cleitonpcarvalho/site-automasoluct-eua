import { BlogError, invalid } from "../errors.ts";
import { BLOG_TEMPLATE } from "../template.ts";
import { BLOG_ASSESSMENT_HREF } from "../conversion.ts";
import type { ImageProvenance, BlogBlock, BlogImage, BlogPost, BlogPostFields, BlogVideo } from "../types.ts";
import { BLOG_IMAGE_FILENAME, parseCreateDraft, parseEditorial, parseProvenance, record } from "../validation.ts";

export type EditorImage = { url: string; alt: string; provenance?: ImageProvenance };
export type EditorBlock = Exclude<BlogBlock, { type: "image" }> | { id: string; type: "image"; image: EditorImage | null; caption?: string };
export type EditorFields = Omit<BlogPostFields, "featuredImage" | "blocks" | "video" | "tags"> & {
  featuredImage: EditorImage | null;
  blocks: EditorBlock[];
  tagsText: string;
  videoUrl: string;
  videoTitle: string;
};

export function emptyAdminBlocks(): BlogBlock[] {
  return BLOG_TEMPLATE.slots.map(slot => {
    switch (slot.type) {
      case "text": return { id: slot.id, type: "text", content: "" };
      case "heading": return { id: slot.id, type: "heading", level: 3, content: "" };
      case "cta": return { id: slot.id, type: "cta", text: "", label: "Get a Free Assessment", href: BLOG_ASSESSMENT_HREF };
      case "image": return { id: slot.id, type: "image", image: null, caption: "" };
      case "video": return { id: slot.id, type: "video" };
      case "form": return { id: slot.id, type: "form", formId: "assessment" };
    }
  });
}

export function videoUrl(video: BlogVideo | null) {
  return !video ? "" : video.provider === "youtube" ? `https://www.youtube.com/watch?v=${video.id}` : `https://vimeo.com/${video.id}`;
}

export function parseEditorVideo(value: unknown, title: unknown): BlogVideo | null {
  if (typeof value !== "string" || typeof title !== "string" || value.length > 1000) return invalid("Invalid video URL or title.");
  if (!value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) throw new Error();
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    let id: string | null = null;
    if (host === "youtu.be" && parts.length === 1) id = parts[0];
    if (["youtube.com", "www.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      if (["embed", "shorts"].includes(parts[0]) && parts.length === 2) id = parts[1];
    }
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return { provider: "youtube", id, title: title.trim() || "Video" };
    if ((["vimeo.com", "www.vimeo.com"].includes(host) && parts.length === 1) || (host === "player.vimeo.com" && parts[0] === "video" && parts.length === 2)) {
      id = parts.at(-1)!;
      if (/^[0-9]{1,12}$/.test(id)) return { provider: "vimeo", id, title: title.trim() || "Video" };
    }
  } catch { /* Report one safe validation error below. */ }
  return invalid("Use a valid HTTPS YouTube or Vimeo video URL.");
}

export function isEditorImageUrl(url: string) {
  return url.startsWith("/uploads/blog/") && BLOG_IMAGE_FILENAME.test(url.slice("/uploads/blog/".length));
}

function editorImage(value: unknown, type: BlogImage["type"]): BlogImage | null {
  if (value === null) return null;
  const image = record(value, "image");
  if (Object.keys(image).some(key => !["url", "alt", "provenance"].includes(key)) || typeof image.url !== "string" || typeof image.alt !== "string") return invalid("Image needs only URL and alt text.");
  const url = image.url.trim();
  if (!url) return null;
  if (!isEditorImageUrl(url)) return invalid("Select an existing image from /uploads/blog/<uuid>.<jpg|jpeg|png|webp|avif>.");
  return { id: url.slice("/uploads/blog/".length, "/uploads/blog/".length + 36), url, alt: image.alt, type, ...(image.provenance === undefined ? {} : { provenance: parseProvenance(image.provenance) }) };
}

export function toEditorFields(post: BlogPost): EditorFields {
  if (post.blocks.some(block => !BLOG_TEMPLATE.slots.some(slot => slot.id === block.id && slot.type === block.type))) {
    throw new BlogError(422, "unsupported_editorial_blocks", "This draft contains blocks outside the approved template. It has not been changed.");
  }
  return {
    ...(post.editorial ? { editorial: post.editorial } : {}), title: post.title, subtitle: post.subtitle, slug: post.slug, seoTitle: post.seoTitle, metaDescription: post.metaDescription,
    focusKeyword: post.focusKeyword, excerpt: post.excerpt, featuredImage: post.featuredImage ? { url: post.featuredImage.url, alt: post.featuredImage.alt, ...(post.featuredImage.provenance ? { provenance: post.featuredImage.provenance } : {}) } : null,
    tagsText: post.tags.join(", "), videoUrl: videoUrl(post.video), videoTitle: post.video?.title ?? "",
    blocks: emptyAdminBlocks().map(empty => {
      const block = post.blocks.find(item => item.id === empty.id);
      if (!block) return empty;
      if (block.type === "image") return { ...block, image: block.image ? { url: block.image.url, alt: block.image.alt, ...(block.image.provenance ? { provenance: block.image.provenance } : {}) } : null };
      return block.type === "heading" ? { ...block, level: 3 } : block;
    }),
  };
}

export function parseEditorFields(value: unknown): BlogPostFields {
  const fields = record(value, "fields");
  const allowed = ["editorial", "title", "subtitle", "slug", "seoTitle", "metaDescription", "focusKeyword", "excerpt", "featuredImage", "blocks", "tagsText", "videoUrl", "videoTitle"];
  if (Object.keys(fields).some(key => !allowed.includes(key)) || typeof fields.tagsText !== "string") return invalid("Invalid editor fields.");
  const blocks = fields.blocks;
  if (!Array.isArray(blocks) || blocks.length !== BLOG_TEMPLATE.slots.length) return invalid("Keep all 26 mandatory blocks in their fixed order.");
  const normalized = blocks.map((value, index) => {
    const block = record(value, "block");
    const slot = BLOG_TEMPLATE.slots[index];
    if (block.id !== slot.id || block.type !== slot.type || (slot.type === "heading" && block.level !== 3) || (slot.type === "form" && block.formId !== "assessment")) return invalid("Block ids, types, H3 levels and order are fixed by the approved template.");
    return block.type === "image" ? { ...block, image: editorImage(block.image, "internal") } : block;
  });
  const video = parseEditorVideo(fields.videoUrl, fields.videoTitle);
  const parsed = parseCreateDraft({
    ...(fields.editorial === undefined ? {} : { editorial: parseEditorial(fields.editorial) }),
    title: fields.title, subtitle: fields.subtitle, slug: fields.slug, seoTitle: fields.seoTitle, metaDescription: fields.metaDescription,
    focusKeyword: fields.focusKeyword, excerpt: fields.excerpt, featuredImage: editorImage(fields.featuredImage, "featured"),
    blocks: fields.editorial && !video ? normalized.filter(block => block.type !== "video") : normalized, tags: fields.tagsText.split(",").map(tag => tag.trim()).filter(Boolean), video,
  });
  if (fields.editorial === undefined) delete parsed.editorial;
  return parsed;
}
