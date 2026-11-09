import type { MetadataRoute } from "next";

import { getBlogService } from "../lib/blog/service.ts";
import { SITE_ORIGIN } from "../lib/seo.ts";

// Read current publication state on every request, including after withdrawal
// or deletion. Metadata routes would otherwise be cached by default.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const sitemapRoutes = [
  { path: "/", changeFrequency: "weekly" },
  { path: "/jobber-automation", changeFrequency: "monthly" },
  { path: "/integrations", changeFrequency: "monthly" },
  { path: "/contact", changeFrequency: "monthly" },
  { path: "/privacy", changeFrequency: "yearly" },
  { path: "/terms", changeFrequency: "yearly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = sitemapRoutes.map(({ path, changeFrequency }) => ({
    url: new URL(path, SITE_ORIGIN).toString(),
    lastModified,
    changeFrequency,
  }));

  // Resolve BLOG_DATA_DIR from the running server's environment, not the image
  // builder. Never hoist this query or cache its results outside the request.
  const service = getBlogService();
  for (let page = 1; ; page++) {
    const posts = service.listPublished(page, 100);
    entries.push(...posts.items.map(post => ({
      url: new URL(`/blog/${post.slug}`, SITE_ORIGIN).toString(),
      lastModified: post.updatedAt || post.publishedAt || undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })));
    if (posts.items.length === 0 || page * posts.pageSize >= posts.total) break;
  }

  return entries;
}
