import { BlogArticle } from "@/components/blog/BlogArticle";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getBlogService } from "@/lib/blog/service";
import { DEFAULT_OG_IMAGE_HEIGHT, DEFAULT_OG_IMAGE_URL, DEFAULT_OG_IMAGE_WIDTH, SITE_NAME, SITE_ORIGIN } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };

function publicImageUrl(value?: string) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value, SITE_ORIGIN);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.protocol = "https:";
    return url.toString();
  } catch { return null; }
}

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const post = getBlogService().getPublished((await params).slug);
  if (!post) return { title: "Article not found", robots: { index: false, follow: false } };
  const title = post.seoTitle.trim() || post.title;
  const description = post.metaDescription.trim() || post.subtitle.trim() || post.excerpt;
  const canonical = new URL(`/blog/${post.slug}`, SITE_ORIGIN).toString();
  const featuredUrl = publicImageUrl(post.featuredImage?.url);
  const image = featuredUrl ? {
    url: featuredUrl, secureUrl: featuredUrl, alt: post.featuredImage?.alt || post.title,
  } : {
    url: DEFAULT_OG_IMAGE_URL, secureUrl: DEFAULT_OG_IMAGE_URL, alt: SITE_NAME,
    type: "image/png", width: DEFAULT_OG_IMAGE_WIDTH, height: DEFAULT_OG_IMAGE_HEIGHT,
  };
  return {
    title: { absolute: title }, description,
    alternates: { canonical },
    openGraph: {
      title, description, type: "article", siteName: SITE_NAME, locale: "en_US",
      url: canonical, publishedTime: post.publishedAt!, modifiedTime: post.updatedAt,
      tags: post.tags, images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function BlogPostPage({ params }: Context) {
  const post = getBlogService().getPublished((await params).slug);
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
