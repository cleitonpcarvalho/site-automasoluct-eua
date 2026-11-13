import { BlogMarkdown } from "./BlogMarkdown";

export function InlineLinks({ content }: { content: string }) {
  return <BlogMarkdown content={content} inline />;
}
