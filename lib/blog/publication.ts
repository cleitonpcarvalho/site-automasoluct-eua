import { BLOG_TEMPLATE } from "./template.ts";
import { BlogError } from "./errors.ts";
import type { BlogPost } from "./types.ts";

export function validatePublication(post: BlogPost): void {
  if (BLOG_TEMPLATE.approval !== "approved") {
    throw new BlogError(503, "editorial_template_pending", "The approved editorial template has not been configured yet.");
  }
  const problems: string[] = [];
  for (const field of ["title", "subtitle", "seoTitle", "metaDescription", "focusKeyword", "excerpt"] as const) {
    if (!post[field].trim()) problems.push(`${field} is required for publication.`);
  }
  if (!post.featuredImage) problems.push("A featured image is required.");
  if (!post.video && BLOG_TEMPLATE.requirements.videos > 0) problems.push("A video reference is required by the approved template.");
  const slots = BLOG_TEMPLATE.slots.filter(slot => !slot.optional || (slot.type === "video" && post.video !== null));
  if (post.blocks.length !== slots.length || slots.some((slot, index) => slot.id !== post.blocks[index]?.id || slot.type !== post.blocks[index]?.type)) {
    problems.push("Blocks must match the official editorial slot ids, types and order.");
  }
  for (const block of post.blocks) {
    if ((block.type === "text" || block.type === "heading") && !block.content.trim()) problems.push(`${block.id} must contain text.`);
    if (block.type === "cta" && !block.text.trim()) problems.push(`${block.id} must contain CTA text.`);
    if (block.type === "video" && !post.video) problems.push("The video block requires post.video.");
    if (block.type === "image" && !block.image) problems.push(`${block.id} requires an existing image and alt text.`);
    if (block.type === "heading" && block.level !== BLOG_TEMPLATE.requirements.headingLevel) problems.push(`${block.id} must be an h3 heading in the official template.`);
  }
  const internalImages = post.blocks.filter(block => block.type === "image");
  if (internalImages.length !== BLOG_TEMPLATE.requirements.internalImages) problems.push("Exactly four internal images are required.");
  const imageIds = [post.featuredImage?.id, ...internalImages.map(block => block.image?.id)].filter(Boolean);
  if (new Set(imageIds).size !== imageIds.length) problems.push("Featured and internal images must have distinct ids.");
  if (problems.length) throw new BlogError(422, "publication_validation_failed", "The post is not ready for publication.", problems);
}
