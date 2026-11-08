import { createMediaHandlers } from "@/lib/blog/media-handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = (request: Request) => createMediaHandlers().list(request);
export const POST = (request: Request) => createMediaHandlers().upload(request);
