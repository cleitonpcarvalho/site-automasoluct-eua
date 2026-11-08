import { createMediaHandlers } from "@/lib/blog/media-handlers";
import { requireBlogScope } from "@/lib/blog/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) { return createMediaHandlers(undefined, (request, write) => { requireBlogScope(request, write ? "posts:write" : "posts:read"); }).get(request, (await context.params).id); }
export async function PATCH(request: Request, context: Context) { return createMediaHandlers(undefined, (request, write) => { requireBlogScope(request, write ? "posts:write" : "posts:read"); }).update(request, (await context.params).id); }
export async function DELETE(request: Request, context: Context) { return createMediaHandlers(undefined, (request, write) => { requireBlogScope(request, write ? "posts:write" : "posts:read"); }).remove(request, (await context.params).id); }
