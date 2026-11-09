// Keep this title-only policy identical in the site and MCP repositories.
export const TITLE_CHARACTER_INSTRUCTION = [
    'TITLE CHARACTER RULE: Use plain natural-language article titles and SEO titles only. Never use special symbols, emojis, decorative characters or decorative punctuation in titles.',
    'Forbidden in titles: +, |, •, →, /, \\, emojis and other decorative symbols. Write words instead of symbol-based separators.',
    'If a generated title contains any forbidden character, rewrite it before presenting it to the user or saving it. Wrong: Jobber + Quo Integration. Correct: Jobber and Quo Integration.',
].join(' ');

export const TITLE_CHARACTER_RULES = {
    fields: ['title', 'seoTitle'],
    forbiddenCharacters: ['+', '|', '•', '→', '/', '\\'],
    allowEmojis: false,
    allowDecorativeCharacters: false,
    rewriteBeforePresentingOrSaving: true,
    instruction: TITLE_CHARACTER_INSTRUCTION,
} as const;

export function hasPlainTitleCharacters(title: string): boolean {
    // Preserve accented/non-Latin words and ordinary grammatical punctuation.
    // Symbols, markup, styled compatibility glyphs and emoji decorations fail.
    return /^[\p{L}\p{M}\p{N} '’",.?!:;()-]*$/u.test(title)
        && title.normalize('NFKC') === title.normalize('NFC')
        && !/[\u0334-\u0338\u034f\ufe00-\ufe0f]|\p{Me}|[.!?:;,]{2,}|([\x22\x27()])\1|(?<![\p{L}\p{M}\p{N}])-|-(?![\p{L}\p{M}\p{N}])/u.test(title);
}
