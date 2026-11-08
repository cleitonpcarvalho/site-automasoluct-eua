import "server-only";

import { readdir } from "node:fs/promises";

import { blogPaths } from "../config.ts";
import { BLOG_IMAGE_FILENAME } from "../validation.ts";

export async function listAdminImages(): Promise<string[]> {
  try {
    const files = await readdir(blogPaths().uploads, { withFileTypes: true });
    return files.filter(file => file.isFile() && BLOG_IMAGE_FILENAME.test(file.name)).map(file => `/uploads/blog/${file.name}`).sort().slice(0, 500);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
