import "server-only";

import { requireBlogScope } from "./auth.ts";
import { getAdminConfig } from "./admin/auth.ts";
import { blogJson, internalBlogRequest, readBlogJson } from "./http.ts";
import { assertPublicationReady } from "./publication.ts";
import { getBlogService, type BlogService } from "./service.ts";
import { parsePostQuery, parsePreviewQuery } from "./validation.ts";

export function createBlogHandlers(resolveService: () => BlogService = getBlogService, authorize = requireBlogScope, resolvePreviewOrigin: () => string = () => getAdminConfig().origin) {
  return {
    list: (request: Request) => internalBlogRequest(request, "posts:read", () => blogJson({ data: resolveService().list(parsePostQuery(new URL(request.url).searchParams)) }), authorize),
    get: (request: Request, id: string) => internalBlogRequest(request, "posts:read", () => blogJson({ data: resolveService().get(id) }), authorize),
    create: (request: Request) => internalBlogRequest(request, "posts:write", async () => {
      const post = resolveService().createDraft(await readBlogJson(request));
      return blogJson({ data: post }, 201, { Location: `/api/internal/blog/posts/${post.id}` });
    }, authorize),
    update: (request: Request, id: string) => internalBlogRequest(request, "posts:write", async () => blogJson({ data: resolveService().update(id, await readBlogJson(request)) }), authorize),
    validate: (request: Request, id: string) => internalBlogRequest(request, "posts:validate", async () => {
      const input = await readBlogJson(request, { allowEmpty: true });
      return blogJson({ data: await resolveService().validate(id, input) });
    }, authorize),
    preview: (request: Request, id: string) => internalBlogRequest(request, "posts:read", async () => {
      const service = resolveService();
      const requested = parsePreviewQuery(new URL(request.url).searchParams);
      const post = service.get(id);
      if (post.editorial) assertPublicationReady(await service.validate(id, { revision: requested ?? post.revision }));
      const preview = service.preview(id, requested ?? post.revision);
      return blogJson({ data: { ...preview, previewUrl: new URL(preview.previewUrl, resolvePreviewOrigin()).href } }, 200, { "X-Robots-Tag": "noindex, nofollow" });
    }, authorize),
    publish: (request: Request, id: string) => internalBlogRequest(request, "posts:publish", async () => blogJson({ data: await resolveService().publish(id, await readBlogJson(request)) }), authorize),
  };
}
