import { inlineLinks } from "./rich-text.ts";

export const BLOG_ASSESSMENT_ID = "free-assessment";
export const BLOG_ASSESSMENT_HREF = `#${BLOG_ASSESSMENT_ID}`;

export const BLOG_CONVERSION_RULES = {
  slot: "closing-text",
  maxParagraphs: 2,
  maxCharactersPerParagraph: 280,
  ctaHref: BLOG_ASSESSMENT_HREF,
  formAnchor: BLOG_ASSESSMENT_ID,
  instructions: [
    "A seção imediatamente antes do formulário é uma ponte curta de conversão, não uma seção educativa.",
    "Usar no máximo 2 parágrafos curtos, com até cerca de 280 caracteres visíveis cada.",
    "Explicar de forma natural e persuasiva por que enviar a avaliação e como ela ajuda a definir o próximo passo. Evitar repetição.",
    "Todos os botões CTA levam ao formulário no mesmo artigo com href #free-assessment; nunca direcionar para /contact ou outra página.",
  ],
} as const;

const fallbackParagraphs = [
  "Tell us what you want to automate, connect, or improve. We’ll review your workflow and identify a practical next step.",
  "Submit the assessment below so we can evaluate your needs, technical scope, and budget before reaching out.",
];

// Keep saved articles intact. Oversized or unfinished closings get a concise
// conversion bridge at render time, in both public articles and private previews.
export function assessmentBridgeParagraphs(content: string, renderLinks = true): string[] {
  const paragraphs = content.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean);
  const characters = new Intl.Segmenter("en", { granularity: "grapheme" });
  const fits = paragraphs.length > 0 && paragraphs.length <= BLOG_CONVERSION_RULES.maxParagraphs && paragraphs.every(paragraph => {
    const visible = renderLinks ? inlineLinks(paragraph).map(part => part.text).join("") : paragraph;
    return Array.from(characters.segment(visible)).length <= BLOG_CONVERSION_RULES.maxCharactersPerParagraph;
  });
  return fits ? paragraphs : [...fallbackParagraphs];
}
