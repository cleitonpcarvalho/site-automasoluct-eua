import "server-only";

import { BlogError, invalid } from "../errors.ts";
import { blogJson, readBlogJson } from "../http.ts";
import { getBlogService, type BlogService } from "../service.ts";
import { parsePostQuery, parseRevision, record } from "../validation.ts";
import { adminCookie, assertAdminOrigin, getAdminAuth, getAdminConfig, requestSessionToken, type AdminConfig } from "./auth.ts";
import { emptyAdminBlocks, parseEditorFields, toEditorFields } from "./editor.ts";

export type AdminAuth = ReturnType<typeof getAdminAuth>;
const headers = { "X-Frame-Options": "DENY", "Content-Security-Policy": "frame-ancestors 'none'", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "same-origin" };
export const adminJson = (value: unknown, status = 200, extra?: HeadersInit) => blogJson(value, status, { ...headers, ...extra });

export function adminListQuery(search: URLSearchParams) {
  const parameters = new URLSearchParams(search);
  if (parameters.get("status") === "") parameters.delete("status");
  const query = parameters.get("q")?.trim() ?? "";
  parameters.delete("q");
  if (query.length > 160) return invalid("Search may not exceed 160 characters.");
  return { ...parsePostQuery(parameters), search: query, sort: "updated" as const };
}

function bodyObject(value: unknown, keys: string[]) {
  const body = record(value, "request");
  if (Object.keys(body).some(key => !keys.includes(key))) return invalid("Unknown or read-only administrator field.");
  return body;
}

export function getAdminPreview(service: BlogService, id: string, expectedRevision: number) {
  const post = service.get(id);
  if (post.revision !== parseRevision(expectedRevision)) throw new BlogError(409, "revision_conflict", "The saved revision changed. Reopen preview from the editor.");
  return post;
}

export function createAdminHandlers(resolveService: () => BlogService = getBlogService, resolveConfig: () => AdminConfig = getAdminConfig, resolveAuth: (config: AdminConfig) => AdminAuth = getAdminAuth) {
  async function execute(request: Request, action: (auth: AdminAuth, config: AdminConfig) => Promise<Response> | Response, authenticated = true) {
    try {
      const config = resolveConfig();
      if (authenticated && !requestSessionToken(request, config)) throw new BlogError(401, "admin_unauthorized", "A valid administrator session is required.");
      const auth = resolveAuth(config);
      if (authenticated) auth.require(request, request.method !== "GET");
      return await action(auth, config);
    } catch (error) {
      if (error instanceof BlogError) return adminJson({ error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } }, error.status, error.status === 429 ? { "Retry-After": "900" } : undefined);
      console.error("Administrator operation failed.", error instanceof Error ? error.name : "UnknownError");
      return adminJson({ error: { code: "internal_error", message: "Unable to complete this administrator operation." } }, 500);
    }
  }
  async function confirmed(request: Request, id: string) {
    const body = bodyObject(await readBlogJson(request), ["expectedRevision", "confirmation"]);
    const revision = parseRevision(body.expectedRevision);
    const service = resolveService();
    const post = service.get(id);
    if (post.revision !== revision) throw new BlogError(409, "revision_conflict", "Post changed. Reload the current revision before confirming.");
    if (body.confirmation !== post.slug) throw new BlogError(400, "confirmation_required", "Confirm this action for the current post slug.");
    return { service, post, revision };
  }
  return {
    login: (request: Request) => execute(request, async (auth, config) => {
      assertAdminOrigin(request, config);
      const body = bodyObject(await readBlogJson(request), ["login", "password"]);
      if (typeof body.login !== "string" || body.login.length > 254 || typeof body.password !== "string" || Buffer.byteLength(body.password) > 1024) return invalid("Invalid login input.");
      const result = await auth.login(body.login, body.password, requestSessionToken(request, config));
      return adminJson({ data: { redirect: "/admin/blog" } }, 200, { "Set-Cookie": adminCookie(config, result.token) });
    }, false),
    logout: (request: Request) => execute(request, (auth, config) => {
      auth.logout(requestSessionToken(request, config));
      return adminJson({ data: { loggedOut: true } }, 200, { "Set-Cookie": adminCookie(config, "", true) });
    }),
    list: (request: Request) => execute(request, () => adminJson({ data: resolveService().list(adminListQuery(new URL(request.url).searchParams)) })),
    get: (request: Request, id: string) => execute(request, () => {
      const post = resolveService().get(id);
      return adminJson({ data: { post, fields: toEditorFields(post) } });
    }),
    create: (request: Request) => execute(request, async () => {
      const body = bodyObject(await readBlogJson(request), ["title", "slug"]);
      const post = resolveService().createDraft({ ...body, blocks: emptyAdminBlocks() });
      return adminJson({ data: post }, 201);
    }),
    update: (request: Request, id: string) => execute(request, async () => {
      const body = bodyObject(await readBlogJson(request), ["expectedRevision", "fields"]);
      const fields = parseEditorFields(body.fields);
      const post = resolveService().update(id, { revision: parseRevision(body.expectedRevision), ...fields });
      return adminJson({ data: post });
    }),
    publish: (request: Request, id: string) => execute(request, async () => {
      const { service, revision } = await confirmed(request, id);
      return adminJson({ data: await service.publish(id, { revision }) });
    }),
    withdraw: (request: Request, id: string) => execute(request, async () => {
      const { service, post, revision } = await confirmed(request, id);
      if (post.status !== "published") throw new BlogError(409, "already_draft", "This post is already a draft.");
      return adminJson({ data: service.update(id, { revision, status: "draft" }) });
    }),
    remove: (request: Request, id: string) => execute(request, async () => {
      const { service, revision } = await confirmed(request, id);
      service.remove(id, revision);
      return adminJson({ data: { deleted: true } });
    }),
  };
}
