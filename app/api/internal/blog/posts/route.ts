import { createBlogHandlers } from "@/lib/blog/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createBlogHandlers();
export const GET = handlers.list;
export const POST = handlers.create;
