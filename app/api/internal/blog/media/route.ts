import { createMediaHandlers } from "@/lib/blog/media-handlers";
import { requireBlogScope } from "@/lib/blog/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (request: Request) => createMediaHandlers(undefined, (request, write) => { requireBlogScope(request, write ? "posts:write" : "posts:read"); }).list(request);
export const POST = (request: Request) => createMediaHandlers(undefined, (request, write) => { requireBlogScope(request, write ? "posts:write" : "posts:read"); }).upload(request);
