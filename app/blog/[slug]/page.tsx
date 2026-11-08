import { BlogArticle } from "@/components/blog/BlogArticle";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getBlogService } from "@/lib/blog/service";
import { SITE_ORIGIN } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const post = getBlogService().getPublished((await params).slug);
  if (!post) return { title: "Article not found", robots: { index: false, follow: false } };
  return {
    title: { absolute: post.seoTitle || post.title }, description: post.metaDescription,
    alternates: { canonical: new URL(`/blog/${post.slug}`, SITE_ORIGIN).toString() },
    openGraph: {
      title: post.seoTitle || post.title, description: post.metaDescription, type: "article",
      url: new URL(`/blog/${post.slug}`, SITE_ORIGIN).toString(), publishedTime: post.publishedAt!, modifiedTime: post.updatedAt,
      tags: post.tags, images: post.featuredImage ? [{ url: post.featuredImage.url, alt: post.featuredImage.alt }] : [],
    },
    twitter: { card: "summary_large_image", title: post.seoTitle || post.title, description: post.metaDescription, images: post.featuredImage ? [post.featuredImage.url] : [] },
  };
}

export default async function BlogPostPage({ params }: Context) {
  const post = getBlogService().getPublished((await params).slug);
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
