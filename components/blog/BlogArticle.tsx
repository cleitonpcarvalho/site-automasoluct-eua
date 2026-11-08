import Link from "next/link";

import { Container } from "@/components/layout/Container";
import type { BlogPost } from "@/lib/blog/types";

import { BlogBlocks } from "./BlogBlocks";
import { BlogImage } from "./BlogImage";
import { PostMeta } from "./PostMeta";

export function BlogArticle({ post }: { post: BlogPost }) {
  return <Container className="max-w-4xl py-8 sm:py-14 lg:py-20">
    <article className="flex min-w-0 flex-col gap-8 [overflow-wrap:anywhere] sm:gap-10">
      <header className="flex min-w-0 flex-col gap-5">
        <Link className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-primary-soft hover:text-white" href="/blog">← All articles</Link>
        <PostMeta date={post.publishedAt ?? post.updatedAt} tags={post.tags} />
        <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{post.title}</h1>
        {post.subtitle && <p className="text-lg leading-8 text-text-medium sm:text-xl">{post.subtitle}</p>}
        {post.featuredImage && <BlogImage featured image={post.featuredImage} />}
      </header>
      <BlogBlocks post={post} />
    </article>
  </Container>;
}
