// Shared with the website. Keep this rule independent of transport schemas.
export const CTA_BUTTON_RULES = {
    minCharacters: 45,
    maxCharacters: 50,
    suffix: ' →',
    counting: 'unicode_grapheme_clusters_including_spaces_and_suffix',
    uniqueWithinPost: true,
    context: 'immediately_previous_section',
    severity: 'error',
    legacyWithoutPolicy: 'warning',
} as const;

const characters = new Intl.Segmenter('en', { granularity: 'grapheme' });
export function countCtaCharacters(label: string): number {
    return Array.from(characters.segment(label)).length;
}
