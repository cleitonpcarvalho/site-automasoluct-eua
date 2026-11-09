import { inlineLinks, isExternalHref } from "@/lib/blog/rich-text";
import styles from "./BlogBlocks.module.css";

export function InlineLinks({ content }: { content: string }) {
  return inlineLinks(content).map((part, index) => part.href
    ? <a className={styles.link} href={part.href} key={index} {...(isExternalHref(part.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{part.text}</a>
    : part.text);
}
