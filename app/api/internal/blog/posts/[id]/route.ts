import { createBlogHandlers } from "@/lib/blog/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createBlogHandlers();
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handlers.get(request, (await context.params).id);
}

export async function PATCH(request: Request, context: Context) {
  return handlers.update(request, (await context.params).id);
}
