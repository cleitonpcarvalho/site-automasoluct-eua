import Link from "next/link";

import type { BlogPostSummary } from "@/lib/blog/types";

import { BlogImage } from "./BlogImage";
import { PostMeta } from "./PostMeta";

export function RecentPosts({ posts }: { posts: BlogPostSummary[] }) {
  if (posts.length === 0) return null;

  return <section aria-labelledby="recent-posts-heading" className="flex min-w-0 flex-col gap-5 border-t border-border-subtle pt-8 sm:pt-10">
    <h2 className="font-heading text-2xl font-bold text-white" id="recent-posts-heading">Recent Posts</h2>
    <ul className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {posts.map(post => <li className="min-w-0" key={post.id}>
        <Link className="group flex h-full min-w-0 flex-col gap-3 rounded-xl border border-border-subtle bg-surface-1 p-4 transition-colors hover:border-primary/50 hover:bg-surface-hover" href={`/blog/${post.slug}`}>
          {post.featuredImage && <BlogImage image={post.featuredImage} />}
          {post.publishedAt && <PostMeta date={post.publishedAt} tags={[]} />}
          <h3 className="line-clamp-2 font-heading text-base font-bold leading-6 text-white transition-colors group-hover:text-primary-soft">{post.title}</h3>
          <p className="line-clamp-2 text-sm leading-6 text-text-medium">{post.excerpt || post.subtitle}</p>
        </Link>
      </li>)}
    </ul>
  </section>;
}
