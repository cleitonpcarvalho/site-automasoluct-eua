import "server-only";

import { resolve } from "node:path";

import { BlogError } from "./errors.ts";

export function blogPaths() {
  return {
    database: resolve(process.env.BLOG_DATA_DIR || "data/blog", "blog.sqlite"),
    uploads: resolve(process.env.BLOG_UPLOAD_DIR || "uploads/blog"),
  };
}

export const BLOG_UPLOAD_URL = "/uploads/blog/";
export const BLOG_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const BLOG_MAX_REQUEST_BYTES = 512 * 1024;

export function blogUploadLimits(environment: Record<string, string | undefined> = process.env) {
  const configured = environment.BLOG_UPLOAD_MAX_BYTES ?? String(BLOG_MAX_IMAGE_BYTES);
  if (!/^[1-9][0-9]*$/.test(configured) || Number(configured) > 25 * 1024 * 1024) {
    throw new BlogError(503, "media_not_configured", "BLOG_UPLOAD_MAX_BYTES must be between 1 and 26214400 bytes.");
  }
  return { maxBytes: Number(configured), maxPixels: 24_000_000, maxDimension: 12_000 };
}
