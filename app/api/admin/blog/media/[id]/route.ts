import { createMediaHandlers } from "@/lib/blog/media-handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) { return createMediaHandlers().get(request, (await context.params).id); }
export async function PATCH(request: Request, context: Context) { return createMediaHandlers().update(request, (await context.params).id); }
export async function DELETE(request: Request, context: Context) { return createMediaHandlers().remove(request, (await context.params).id); }
