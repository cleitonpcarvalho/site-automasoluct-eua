import { ContactAssessmentForm } from "@/components/sections/contact/ContactAssessmentForm";
import { assessmentBridgeParagraphs, BLOG_ASSESSMENT_HREF, BLOG_ASSESSMENT_ID } from "@/lib/blog/conversion";
import type { BlogPost } from "@/lib/blog/types";

import { InlineLinks } from "./InlineLinks";
import { BlogImage } from "./BlogImage";
import styles from "./BlogBlocks.module.css";

export function BlogBlocks({ post }: { post: BlogPost }) {
  return (
    <div className="flex min-w-0 flex-col gap-8 [overflow-wrap:anywhere] sm:gap-10">
      {post.blocks.map(block => {
        switch (block.type) {
          case "text": {
            const paragraphs = block.id === "closing-text" ? assessmentBridgeParagraphs(block.content, Boolean(post.editorial)) : block.content.split(/\n\s*\n/);
            return <div className="flex flex-col gap-5 text-base leading-8 text-text-medium" id={block.id} key={block.id}>{paragraphs.map((paragraph, index) => <p className="whitespace-pre-line" key={index}>{post.editorial ? <InlineLinks content={paragraph} /> : paragraph}</p>)}</div>;
          }
          case "heading": {
            const Heading = block.level === 3 ? "h3" : "h2";
            return <Heading className="scroll-mt-28 font-heading text-2xl font-bold leading-snug text-white sm:text-3xl" id={block.id} key={block.id}>{post.editorial ? <InlineLinks content={block.content} /> : block.content}</Heading>;
          }
          case "cta":
            return <aside aria-label="Contact Automa Soluct" className={post.editorial ? "flex flex-col items-start gap-3" : "flex flex-col items-start gap-5 rounded-xl border border-primary/30 bg-primary/10 p-5 sm:p-7"} id={block.id} key={block.id}>
              {block.text && <p className="text-base leading-7 text-white">{post.editorial ? <InlineLinks content={block.text} /> : block.text}</p>}
              <a className={styles.ctaButton} href={BLOG_ASSESSMENT_HREF}>{block.label}</a>
            </aside>;
          case "image":
            if (!block.image) return <div className="rounded-xl border border-dashed border-border-strong p-8 text-sm text-text-medium" id={block.id} key={block.id}>Image pending · {block.id}</div>;
            return <figure className="min-w-0" id={block.id} key={block.id}><BlogImage image={block.image} />{block.caption && <figcaption className="mt-3 text-sm leading-6 text-text-medium">{post.editorial ? <InlineLinks content={block.caption} /> : block.caption}</figcaption>}</figure>;
          case "video": {
            if (!post.video) return null;
            const source = post.video.provider === "youtube" ? `https://www.youtube-nocookie.com/embed/${post.video.id}` : `https://player.vimeo.com/video/${post.video.id}`;
            return <div className="aspect-video min-w-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-1" id={block.id} key={block.id}><iframe allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="h-full w-full" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" src={source} title={post.video.title} /></div>;
          }
          case "form":
            return <section aria-label="Request a technical assessment" className={styles.form} id={block.id} key={block.id}><div className="scroll-mt-28" id={BLOG_ASSESSMENT_ID}><ContactAssessmentForm compactVerification /></div></section>;
        }
      })}
    </div>
  );
}
