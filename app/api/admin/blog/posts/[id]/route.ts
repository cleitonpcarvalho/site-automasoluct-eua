import { createAdminHandlers } from "@/lib/blog/admin/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return createAdminHandlers().get(request, (await context.params).id);
}
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return createAdminHandlers().update(request, (await context.params).id);
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  return createAdminHandlers().remove(request, (await context.params).id);
}
