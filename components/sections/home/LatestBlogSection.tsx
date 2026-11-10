import Link from "next/link";

import { BlogImage } from "@/components/blog/BlogImage";
import { PostMeta } from "@/components/blog/PostMeta";
import { Container } from "@/components/layout/Container";
import type { BlogPostSummary } from "@/lib/blog/types";

export function LatestBlogSection({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <section aria-label="Latest from the Blog" className="border-b border-white/[0.08]">
      <Container className="flex max-w-7xl flex-col gap-5 py-8 md:gap-12 md:py-20 lg:gap-14 lg:py-24">
        <header className="flex max-w-2xl flex-col gap-1.5 md:gap-3" data-reveal>
          <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-primary-soft">
            Journal
          </p>
          <h2 className="font-heading text-xl font-bold leading-tight tracking-[-0.02em] text-white md:text-[28px] md:leading-9 lg:text-[30px] lg:leading-10">
            Latest from the Blog
          </h2>
          <p className="text-xs leading-relaxed text-[#9CA3AF] md:text-sm">
            Practical insights on Jobber, integrations and business automation.
          </p>
        </header>

        {posts.length > 0 ? (
          <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {posts.map((post, index) => (
              <article
                className="home-interactive-card flex min-w-0 flex-col gap-4 rounded-xl border border-white/[0.08] bg-surface-1 p-4"
                data-reveal
                data-reveal-delay={String(index)}
                key={post.id}
              >
                {post.featuredImage && <BlogImage image={post.featuredImage} />}
                <PostMeta date={post.publishedAt!} tags={post.tags.slice(0, 1)} />
                <h3 className="break-words font-heading text-base font-bold leading-6 text-white">
                  <Link className="transition-colors hover:text-primary-soft" href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="line-clamp-3 break-words text-sm leading-6 text-text-medium">
                  {post.excerpt}
                </p>
                <Link
                  aria-label={`Read article: ${post.title}`}
                  className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-lg text-sm font-semibold text-primary-soft transition-colors hover:text-white"
                  href={`/blog/${post.slug}`}
                >
                  Read article <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-white/[0.08] bg-surface-1 p-6 text-sm leading-6 text-text-medium">
            Articles are on the way. Check back soon for practical insights.
          </p>
        )}

        <div className="flex justify-center" data-reveal>
          <Link
            className="home-button inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.1] bg-[#08080A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-surface-2"
            href="/blog"
          >
            View all articles <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
