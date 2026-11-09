import { randomUUID } from "node:crypto";

import { BLOG_TEMPLATE } from "../../lib/blog/template.ts";
import type { BlogBlock, BlogImage, BlogPostFields } from "../../lib/blog/types.ts";

export const testPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nXcAAAAASUVORK5CYII=", "base64");

export function imageFixture(type: BlogImage["type"] = "internal"): BlogImage {
  const id = randomUUID();
  return { id, url: `/uploads/blog/${id}.png`, alt: "Test-only workflow diagram", type };
}

const ctaLabels = ["Automate missed calls and book more jobs today →", "Connect your systems and simplify daily work →", "Build custom workflows around your operations →", "Plan your next automation with our engineers →"];

export function completePostFixture(withVideo = true): BlogPostFields {
  const blocks = BLOG_TEMPLATE.slots.filter(slot => !slot.optional || (slot.type === "video" && withVideo)).map((slot): BlogBlock => {
    switch (slot.type) {
      case "text": return { id: slot.id, type: "text", content: "Test-only editorial paragraph.\n\nA second paragraph for rendering verification." };
      case "heading": return { id: slot.id, type: "heading", level: slot.level ?? 3, content: "Test-only section heading" };
      case "cta": return { id: slot.id, type: "cta", text: "Discuss a workflow with our engineering team.", label: ctaLabels[Number(slot.id.slice(-1)) - 1], href: "/contact" };
      case "image": return { id: slot.id, type: "image", image: imageFixture(), caption: "Test-only illustration." };
      case "video": return { id: slot.id, type: "video" };
      case "form": return { id: slot.id, type: "form", formId: "assessment" };
    }
  });
  return {
    title: "Test-only Jobber workflow", subtitle: "A local test fixture, never production content.", slug: `test-only-${randomUUID()}`,
    seoTitle: "Test-only workflow from Automa Soluct", metaDescription: "An isolated test fixture for blog validation.",
    focusKeyword: "test workflow", excerpt: "A short test-only excerpt.", featuredImage: { ...imageFixture("featured"), provenance: { sourceAssets: ["default_cover_portrait", "default_cover_logo"] } },
    editorial: { policyVersion: 1, videoRequestedByUser: withVideo },
    blocks, video: withVideo ? { provider: "youtube", id: "AAAAAAAAAAA", title: "Test-only video reference" } : null,
    tags: ["Jobber", "Automation"],
  };
}
