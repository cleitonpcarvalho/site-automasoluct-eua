import { BLOG_TEMPLATE, LEGACY_BLOG_TEMPLATE } from "./template.ts";
import { imageAssociationStatus, postImageReferences } from "./image-workflow.ts";
import { validateEditorial } from "./editorial-policy.ts";
import { BlogError } from "./errors.ts";
import { collectPostFieldIssues } from "./validation.ts";
import type { ImageProvenance, BlogImage, BlogPost, BlogPostValidation, BlogValidationIssue } from "./types.ts";

function editorialIssues(post: BlogPost): BlogValidationIssue[] {
  const template = post.editorial ? BLOG_TEMPLATE : LEGACY_BLOG_TEMPLATE;
  if (template.approval !== "approved") {
    return [{ code: "editorial_template_pending", field: "blocks", message: "The approved editorial template has not been configured yet." }];
  }
  const problems = collectPostFieldIssues(post);
  const add = (code: string, field: string, message: string) => problems.push({ code, field, message });
  for (const field of ["title", "subtitle", "seoTitle", "metaDescription", "focusKeyword", "excerpt"] as const) {
    if (typeof post[field] !== "string" || !post[field].trim()) add("required_field", field, `${field} is required for publication.`);
  }
  if (!post.featuredImage) add("required_image", "featuredImage", "A featured image is required.");
  if (!post.video && template.requirements.videos > 0) add("required_video", "video", "A video reference is required by the approved template.");
  const blocks = Array.isArray(post.blocks) ? post.blocks : [];
  const slots = template.slots.filter(slot => !slot.optional || (slot.type === "video" && post.video !== null));
  if (blocks.length !== slots.length || slots.some((slot, index) => slot.id !== blocks[index]?.id || slot.type !== blocks[index]?.type)) {
    add("invalid_template", "blocks", "Blocks must match the official editorial slot ids, types and order.");
  }
  for (const [index, block] of blocks.entries()) {
    if (!block || typeof block !== "object") continue; // Reported by the shared input parser.
    if ((block.type === "text" || block.type === "heading") && (typeof block.content !== "string" || !block.content.trim())) add("required_text", `blocks.${index}.content`, `${block.id} must contain text.`);
    if (!post.editorial && block.type === "cta" && (typeof block.text !== "string" || !block.text.trim())) add("required_cta_text", `blocks.${index}.text`, `${block.id} must contain CTA text.`);
    if (block.type === "video" && !post.video) add("required_video", "video", "The video block requires post.video.");
    if (block.type === "image" && !block.image) add("required_image", `blocks.${index}.image`, `${block.id} requires an existing image and alt text.`);
    if (block.type === "heading" && block.level !== template.requirements.headingLevel) add("invalid_heading_level", `blocks.${index}.level`, `${block.id} must be an h3 heading in the official template.`);
  }
  const internalImages = blocks.filter(block => block?.type === "image");
  if (internalImages.length !== template.requirements.internalImages) add("invalid_image_count", "blocks", "Exactly four internal images are required.");
  const imageIds = [post.featuredImage?.id, ...internalImages.map(block => block.image?.id)].filter(Boolean);
  if (new Set(imageIds).size !== imageIds.length) add("duplicate_image", "blocks", "Featured and internal images must have distinct ids.");
  return problems;
}

function report(post: BlogPost, errors: BlogValidationIssue[]): BlogPostValidation {
  return { valid: errors.length === 0, postId: post.id, revision: post.revision, errors, warnings: [] };
}

// Authoritative, read-only validation shared by the validate and publish flows.
// Only storage access is injected; callers cannot supply different editorial rules.
export async function validateBlogPost(post: BlogPost, checkImage: (image: BlogImage, requireConfirmedUpload?: boolean) => Promise<void | ImageProvenance>): Promise<BlogPostValidation> {
  post = structuredClone(post);
  const result = report(post, editorialIssues(post));
  const verifiedFields: string[] = [];
  const images = postImageReferences(post);
  for (const { image, field } of images) {
    try {
      const stored = await checkImage(image, post.editorial?.policyVersion === 1);
      verifiedFields.push(field);
      // Metadata from storage cannot be hidden by omitting it from a post reference.
      if (stored) image.provenance = { ...image.provenance, ...stored, sourceAssets: [...new Set([...(image.provenance?.sourceAssets ?? []), ...stored.sourceAssets])] };
    }
    catch (error) {
      if (!(error instanceof BlogError)) throw error;
      if (error.status === 404) result.errors.push({ code: "missing_image", field, message: "All referenced images must exist in blog storage before publication." });
      else if (error.status === 422 && ["media_upload_unconfirmed", "media_reference_mismatch", "media_content_mismatch", "image_placeholder", "cover_source_asset"].includes(error.code)) result.errors.push({ code: error.code, field, message: error.message });
      else throw error;
    }
  }
  const policy = validateEditorial(post);
  result.errors.push(...policy.errors);
  result.warnings.push(...policy.warnings);
  result.imageStatus = imageAssociationStatus(post, verifiedFields);
  if (post.editorial?.policyVersion === 1 && !result.imageStatus.complete && result.errors.length === 0) result.errors.push({ code: "image_verification_incomplete", field: "images", message: "Five distinct associated images with confirmed uploads and stored files are required." });
  result.valid = result.errors.length === 0;
  return result;
}

export function assertPublicationReady(result: BlogPostValidation): void {
  if (result.valid) return;
  if (result.errors.some(issue => issue.code === "editorial_template_pending")) {
    throw new BlogError(503, "editorial_template_pending", "The approved editorial template has not been configured yet.");
  }
  // Preserve the existing HTTP/admin error contract while sharing structured rules.
  const missingImage = result.errors.some(issue => issue.code === "missing_image");
  throw new BlogError(422, missingImage ? "missing_image" : "publication_validation_failed", missingImage ? "All referenced images must exist in blog storage before publication." : "The post is not ready for publication.", result.errors.map(issue => issue.message));
}

// Existing synchronous editorial-only check; full readiness also checks storage.
export function validatePublication(post: BlogPost): void {
  const policy = validateEditorial(post);
  assertPublicationReady(report(post, [...editorialIssues(post), ...policy.errors]));
}
