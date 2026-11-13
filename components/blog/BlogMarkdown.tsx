import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { isExternalHref, safeHref } from "@/lib/blog/rich-text";
import styles from "./BlogBlocks.module.css";

const components: Components = {
  a({ children, href, title, id, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy }) {
    if (!href) return <>{children}</>;
    return <a aria-describedby={ariaDescribedBy} aria-label={ariaLabel} className={styles.link} href={href} id={id} title={title} {...(isExternalHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
  },
  table({ children }) {
    return <div aria-label="Scrollable table" className={styles.tableScroll} role="region" tabIndex={0}><table>{children}</table></div>;
  },
  pre({ children }) {
    return <pre tabIndex={0}>{children}</pre>;
  },
};

const inlineElements = ["a", "br", "code", "del", "em", "strong"];

// Both full text blocks and inline fields use the same parser and URL policy.
// No raw-HTML plugin: HTML stays escaped, and images use the existing image blocks.
export function BlogMarkdown({ content, inline = false }: { content: string; inline?: boolean }) {
  const rendered = <Markdown
    allowedElements={inline ? inlineElements : undefined}
    components={components}
    disallowedElements={inline ? undefined : ["img"]}
    remarkPlugins={[remarkGfm]}
    unwrapDisallowed
    urlTransform={url => safeHref(url) ? url : undefined}
  >{content}</Markdown>;

  return inline ? rendered : <div className={styles.markdown}>{rendered}</div>;
}
