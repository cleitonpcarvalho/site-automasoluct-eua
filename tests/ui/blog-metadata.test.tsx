import { beforeEach, expect, test, vi } from "vitest";

import { generateMetadata } from "@/app/blog/[slug]/page";
import { DEFAULT_OG_IMAGE_URL, SITE_NAME } from "@/lib/seo";
import type { BlogPost } from "@/lib/blog/types";
import { completePostFixture } from "../blog/fixtures";

const source = vi.hoisted(() => ({ getPublished: vi.fn() }));
vi.mock("@/lib/blog/service", () => ({ getBlogService: () => source }));
vi.mock("@/components/blog/BlogArticle", () => ({ BlogArticle: () => null }));

let post: BlogPost;
beforeEach(() => {
  post = { ...completePostFixture(false), id: "metadata-test", slug: "metadata-test", status: "published", revision: 1, createdAt: "2026-01-01T12:00:00Z", updatedAt: "2026-01-03T12:00:00Z", publishedAt: "2026-01-02T12:00:00Z" };
  source.getPublished.mockImplementation((slug: string) => slug === post.slug ? post : null);
});
const metadata = () => generateMetadata({ params: Promise.resolve({ slug: post.slug }) });

test("published articles generate SEO, canonical and article social metadata from their stored fields", async () => {
  const result = await metadata();
  const canonical = "https://automasoluct.com/blog/metadata-test";
  const url = new URL(post.featuredImage!.url, "https://automasoluct.com").toString();
  expect(source.getPublished).toHaveBeenCalledWith(post.slug);
  expect(result.title).toEqual({ absolute: post.seoTitle });
  expect(result.description).toBe(post.metaDescription);
  expect(result.alternates?.canonical).toBe(canonical);
  expect(result.openGraph).toEqual({
    title: post.seoTitle, description: post.metaDescription, type: "article", siteName: SITE_NAME, locale: "en_US", url: canonical,
    publishedTime: post.publishedAt, modifiedTime: post.updatedAt, tags: post.tags,
    images: [{ url, secureUrl: url, alt: post.featuredImage!.alt }],
  });
  expect(result.twitter).toEqual({ card: "summary_large_image", title: post.seoTitle, description: post.metaDescription, images: result.openGraph?.images });
});

test("an absolute stored HTTPS featured image is preserved exactly", async () => {
  post.featuredImage!.url = "https://images.example.com/original-featured.png?version=2";
  expect((await metadata()).openGraph?.images).toEqual([{ url: post.featuredImage!.url, secureUrl: post.featuredImage!.url, alt: post.featuredImage!.alt }]);
});

test("social image URLs always use HTTPS", async () => {
  post.featuredImage!.url = "http://automasoluct.com/uploads/blog/cover.png";
  expect((await metadata()).openGraph?.images).toEqual([{ url: "https://automasoluct.com/uploads/blog/cover.png", secureUrl: "https://automasoluct.com/uploads/blog/cover.png", alt: post.featuredImage!.alt }]);
});

test.each([null, "", "data:image/png;base64,test", "https://["])("missing or unusable featured image falls back to the existing site image (%s)", async value => {
  if (value === null) post.featuredImage = null;
  else post.featuredImage!.url = value;
  const result = await metadata();
  const expected = [{ url: DEFAULT_OG_IMAGE_URL, secureUrl: DEFAULT_OG_IMAGE_URL, alt: SITE_NAME, type: "image/png", width: 1731, height: 909 }];
  expect(result.openGraph?.images).toEqual(expected);
  expect(result.twitter?.images).toEqual(expected);
});

test("title and description use article fallbacks without editing stored content", async () => {
  post.seoTitle = ""; post.metaDescription = "";
  const before = structuredClone(post);
  const result = await metadata();
  expect(result.title).toEqual({ absolute: post.title });
  expect(result.description).toBe(post.subtitle);
  expect(post).toEqual(before);
  post.subtitle = "";
  expect((await metadata()).description).toBe(post.excerpt);
});

test("unpublished or missing slugs do not expose article metadata", async () => {
  source.getPublished.mockReturnValue(null);
  const result = await metadata();
  expect(result.robots).toEqual({ index: false, follow: false });
  expect(result.openGraph).toBeUndefined();
  expect(result.twitter).toBeUndefined();
  expect(result.description).toBeUndefined();
  expect(JSON.stringify(result)).not.toContain(post.title);
});
