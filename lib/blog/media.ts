import "server-only";

import { constants } from "node:fs";
import { open, realpath } from "node:fs/promises";
import { join } from "node:path";

import { blogPaths } from "./config.ts";
import { BlogError } from "./errors.ts";
import { BLOG_IMAGE_FILENAME } from "./validation.ts";

const imageTypes: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

function matchesImage(bytes: Buffer, extension: string): boolean {
  switch (extension) {
    case "jpg": case "jpeg": return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "png": return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    case "webp": return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    case "avif": return bytes.toString("ascii", 4, 8) === "ftyp" && /avif|avis/.test(bytes.toString("ascii", 8, 32));
    default: return false;
  }
}

export async function readBlogImage(filename: string, directory = blogPaths().uploads) {
  const missing = () => new BlogError(404, "image_not_found", "Blog image not found.");
  if (!BLOG_IMAGE_FILENAME.test(filename)) throw missing();
  try {
    const root = await realpath(directory);
    const file = await open(join(root, filename), constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const info = await file.stat();
      // Do not break existing URLs if the upload limit is lowered later.
      if (!info.isFile() || info.size > 25 * 1024 * 1024 || info.size === 0) throw missing();
      const bytes = await file.readFile();
      const extension = filename.split(".").at(-1)!;
      if (!matchesImage(bytes, extension)) throw missing();
      return { bytes, contentType: imageTypes[extension] };
    } finally { await file.close(); }
  } catch (error) {
    if (error instanceof BlogError) throw error;
    if (error && typeof error === "object" && "code" in error && ["ENOENT", "ENOTDIR", "ELOOP"].includes(String(error.code))) throw missing();
    throw error;
  }
}

export async function blogImageResponse(filename: string, directory = blogPaths().uploads) {
  try {
    const { bytes, contentType } = await readBlogImage(filename, directory);
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": contentType, "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    } });
  } catch (error) {
    return new Response(null, { status: error instanceof BlogError ? error.status : 500, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  }
}
