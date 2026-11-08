import { createAdminHandlers } from "@/lib/blog/admin/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return createAdminHandlers().login(request);
}
