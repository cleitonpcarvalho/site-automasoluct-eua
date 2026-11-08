import "server-only";

import { BLOG_MAX_REQUEST_BYTES } from "./config.ts";
import { BlogError } from "./errors.ts";
import { requireBlogScope, type BlogScope } from "./auth.ts";

export function blogJson(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", ...headers },
  });
}

export async function readBlogJson(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    throw new BlogError(415, "unsupported_media_type", "Use Content-Type: application/json.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new BlogError(400, "invalid_json", "A JSON body is required.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > BLOG_MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new BlogError(413, "request_too_large", "Blog requests may not exceed 512 KiB.");
      }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { throw new BlogError(400, "invalid_json", "The request body is not valid JSON."); }
}

export async function internalBlogRequest(request: Request, scope: BlogScope, action: () => Response | Promise<Response>, authorize = requireBlogScope): Promise<Response> {
  try {
    authorize(request, scope);
    return await action();
  } catch (error) {
    if (error instanceof BlogError) {
      return blogJson({ error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } }, error.status, error.status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined);
    }
    console.error("Internal blog operation failed.", error instanceof Error ? error.name : "UnknownError");
    return blogJson({ error: { code: "internal_error", message: "Unable to complete this blog operation." } }, 500);
  }
}
