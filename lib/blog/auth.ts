import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { BlogError } from "./errors.ts";

export type BlogScope = "posts:read" | "posts:validate" | "posts:write" | "posts:publish";
export type BlogPrincipal = { kind: "service"; scopes: readonly BlogScope[] };

const credentials: { variable: string; scopes: readonly BlogScope[] }[] = [
  { variable: "BLOG_API_READ_TOKEN", scopes: ["posts:read", "posts:validate"] },
  { variable: "BLOG_API_WRITE_TOKEN", scopes: ["posts:read", "posts:validate", "posts:write"] },
  { variable: "BLOG_API_PUBLISH_TOKEN", scopes: ["posts:read", "posts:publish"] },
];

const digest = (value: string) => createHash("sha256").update(value).digest();

// Service-token boundary. Human sessions use the separate admin adapter.
// No cookies, login, query-string keys or NEXT_PUBLIC_* credentials are accepted here.
export function requireBlogScope(request: Request, scope: BlogScope, environment: Record<string, string | undefined> = process.env): BlogPrincipal {
  const configured = credentials.flatMap(credential => {
    const token = environment[credential.variable];
    return token ? [{ ...credential, token }] : [];
  });
  if (!configured.length || configured.some(item => item.token.length < 32) || new Set(configured.map(item => item.token)).size !== configured.length) {
    throw new BlogError(503, "auth_not_configured", "Internal blog authentication is not configured correctly.");
  }
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ") || header.length > 4096) {
    throw new BlogError(401, "unauthorized", "A valid Bearer credential is required.");
  }
  const supplied = digest(header.slice(7));
  let principal: BlogPrincipal | undefined;
  for (const credential of configured) {
    if (timingSafeEqual(supplied, digest(credential.token))) principal = { kind: "service", scopes: credential.scopes };
  }
  if (!principal) throw new BlogError(401, "unauthorized", "A valid Bearer credential is required.");
  if (!principal.scopes.includes(scope)) throw new BlogError(403, "forbidden", "This credential does not grant the required permission.");
  return principal;
}
