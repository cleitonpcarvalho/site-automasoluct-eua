import { blogImageResponse } from "@/lib/blog/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  return blogImageResponse((await context.params).filename);
}
