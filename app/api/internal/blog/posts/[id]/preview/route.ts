import { createBlogHandlers } from "@/lib/blog/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createBlogHandlers();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return handlers.preview(request, (await context.params).id);
}
