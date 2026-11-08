import Link from "next/link";

import type { BlogPostSummary } from "@/lib/blog/types";

import { BlogImage } from "./BlogImage";
import { PostMeta } from "./PostMeta";

export function PostCard({ post, featured = false }: { post: BlogPostSummary; featured?: boolean }) {
  return (
    <article className={`min-w-0 rounded-2xl border border-border-subtle bg-surface-1 p-4 sm:p-6 ${featured ? "grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10" : "flex flex-col gap-5"}`}>
      {post.featuredImage && <BlogImage featured={featured} image={post.featuredImage} />}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {featured && <p className="font-mono text-xs uppercase tracking-wider text-primary-soft">Featured article</p>}
        <PostMeta date={post.publishedAt!} tags={post.tags} />
        <h2 className={`break-words font-heading font-bold leading-tight text-white ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}>
          <Link className="block min-h-11 rounded-sm transition-colors hover:text-primary-soft" href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="break-words text-sm leading-6 text-text-medium">{post.excerpt}</p>
        <Link aria-label={`Read article: ${post.title}`} className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-lg text-sm font-semibold text-primary-soft hover:text-white" href={`/blog/${post.slug}`}>
          Read article <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
