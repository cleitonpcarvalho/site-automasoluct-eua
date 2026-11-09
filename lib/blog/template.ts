import { CTA_BUTTON_RULES } from "./cta-policy.ts";
import type { BlogBlock } from "./types.ts";

export type BlogTemplateSlot = {
  id: string;
  type: BlogBlock["type"];
  purpose: string;
  level?: 2 | 3;
  optional?: boolean;
};

// The exact 26-slot editorial order supplied and approved by the user.
// Do not reorder or simplify it. Title, subtitle, excerpt and featured image are
// post-level fields outside this sequence. The introduction counts as one text.
export const LEGACY_BLOG_TEMPLATE: {
  id: string;
  version: number;
  approval: "pending" | "approved";
  fieldsOutsideSequence: readonly string[];
  requirements: { ctas: number; internalImages: number; headings: number; headingLevel: 3; textBlocksIncludingIntroduction: number; videos: number; finalForms: number };
  slots: readonly BlogTemplateSlot[];
} = {
  id: "automa-soluct-blog",
  version: 1,
  approval: "approved",
  fieldsOutsideSequence: ["title", "subtitle", "excerpt", "featuredImage", "seoTitle", "metaDescription", "focusKeyword", "tags"],
  requirements: { ctas: 4, internalImages: 4, headings: 6, headingLevel: 3, textBlocksIncludingIntroduction: 10, videos: 1, finalForms: 1 },
  slots: [
    { id: "introduction", type: "text", purpose: "1. Introdução" },
    { id: "cta-1", type: "cta", purpose: "2. CTA 1" },
    { id: "heading-1", type: "heading", level: 3, purpose: "3. Heading 1 (H3)" },
    { id: "text-1", type: "text", purpose: "4. Bloco de texto" },
    { id: "image-1", type: "image", purpose: "5. Imagem 1" },
    { id: "heading-2", type: "heading", level: 3, purpose: "6. Heading 2 (H3)" },
    { id: "text-2", type: "text", purpose: "7. Bloco de texto" },
    { id: "cta-2", type: "cta", purpose: "8. CTA 2" },
    { id: "image-2", type: "image", purpose: "9. Imagem 2" },
    { id: "text-3", type: "text", purpose: "10. Bloco de texto" },
    { id: "cta-3", type: "cta", purpose: "11. CTA 3" },
    { id: "heading-3", type: "heading", level: 3, purpose: "12. Heading 3 (H3)" },
    { id: "text-4", type: "text", purpose: "13. Bloco de texto" },
    { id: "image-3", type: "image", purpose: "14. Imagem 3" },
    { id: "heading-4", type: "heading", level: 3, purpose: "15. Heading 4 (H3)" },
    { id: "text-5", type: "text", purpose: "16. Bloco de texto" },
    { id: "cta-4", type: "cta", purpose: "17. CTA 4" },
    { id: "image-4", type: "image", purpose: "18. Imagem 4" },
    { id: "text-6", type: "text", purpose: "19. Bloco de texto" },
    { id: "heading-5", type: "heading", level: 3, purpose: "20. Heading 5 (H3)" },
    { id: "text-7", type: "text", purpose: "21. Bloco de texto" },
    { id: "video", type: "video", purpose: "22. Vídeo obrigatório" },
    { id: "text-8", type: "text", purpose: "23. Bloco de texto" },
    { id: "heading-6", type: "heading", level: 3, purpose: "24. Heading 6 (H3)" },
    { id: "closing-text", type: "text", purpose: "25. Bloco de texto final" },
    { id: "final-form", type: "form", purpose: "26. Formulário final" },
  ],
};

// Existing records retain v1 unless the author explicitly adopts the new policy.
export const BLOG_TEMPLATE = {
  ...LEGACY_BLOG_TEMPLATE, version: 3, editorialPolicyVersion: 1,
  ctaButtonRules: CTA_BUTTON_RULES,
  fieldsOutsideSequence: [...LEGACY_BLOG_TEMPLATE.fieldsOutsideSequence, "editorial"],
  requirements: { ...LEGACY_BLOG_TEMPLATE.requirements, videos: 0 },
  slots: LEGACY_BLOG_TEMPLATE.slots.map(slot => slot.type === "video" ? { ...slot, optional: true, purpose: "Vídeo somente com pedido explícito do usuário" } : slot),
};
