// Deliberately small inline-link grammar, shared with the blog renderer.
// Raw HTML is never interpreted. React escapes all labels and surrounding text.
export function safeHref(href: string): boolean {
    if (/[\\\s]/.test(href) || [...href].some(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127)) return false;
    if (/^\/(?!\/)/.test(href) || /^#[A-Za-z][\w-]*$/.test(href)) return true;
    try { const url = new URL(href); return url.protocol === 'https:' && !url.username && !url.password; }
    catch { return false; }
}
export type InlinePart = { text: string; href?: string };
export function isExternalHref(href: string): boolean {
    try { const url = new URL(href); return url.protocol === 'https:' && !['automasoluct.com', 'www.automasoluct.com'].includes(url.hostname); }
    catch { return false; }
}
export function inlineLinks(content: string): InlinePart[] {
    const parts: InlinePart[] = [];
    let start = 0;
    for (const match of content.matchAll(/\[([^[\]\n]+)\]\(([^\s()]+)\)/g)) {
        if (!safeHref(match[2]!)) continue;
        if (match.index > start) parts.push({ text: content.slice(start, match.index) });
        parts.push({ text: match[1]!, href: match[2]! });
        start = match.index + match[0].length;
    }
    if (start < content.length) parts.push({ text: content.slice(start) });
    return parts;
}
