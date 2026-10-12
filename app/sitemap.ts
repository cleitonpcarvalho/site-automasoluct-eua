import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/seo";

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

  return sitemapRoutes.map(({ path, changeFrequency }) => ({
    url: new URL(path, SITE_ORIGIN).toString(),
    lastModified,
    changeFrequency,
  }));
}
