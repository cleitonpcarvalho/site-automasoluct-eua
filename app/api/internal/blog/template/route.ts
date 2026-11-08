import { blogJson, internalBlogRequest } from "@/lib/blog/http";
import { BLOG_TEMPLATE } from "@/lib/blog/template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return internalBlogRequest(request, "posts:read", () => blogJson({ data: BLOG_TEMPLATE }));
}
