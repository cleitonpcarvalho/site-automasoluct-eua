import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";

import { requireBlogScope } from "../../lib/blog/auth.ts";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { BlogError } from "../../lib/blog/errors.ts";
import { createBlogHandlers } from "../../lib/blog/handlers.ts";
import { readBlogImage } from "../../lib/blog/media.ts";
import { validateBlogPost } from "../../lib/blog/publication.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createBlogService } from "../../lib/blog/service.ts";
import type { BlogImage, BlogPostFields } from "../../lib/blog/types.ts";
import { completePostFixture, testPng } from "./fixtures.ts";

const credentials = { BLOG_API_READ_TOKEN: "validation-read-".padEnd(48, "r"), BLOG_API_WRITE_TOKEN: "validation-write-".padEnd(48, "w"), BLOG_API_PUBLISH_TOKEN: "validation-publish-".padEnd(48, "p") };
const code = (expected: string) => (error: unknown) => error instanceof BlogError && error.code === expected;
const ignoreImages = async () => {};

function store(t: TestContext, checkImage: (image: BlogImage) => Promise<void> = ignoreImages) {
  const database = openBlogDatabase(":memory:");
  t.after(() => database.close());
  const repository = createPostRepository(database);
  const service = createBlogService(repository, checkImage);
  const handlers = createBlogHandlers(() => service, (request, scope) => requireBlogScope(request, scope, credentials), () => "http://localhost:3000");
  return { database, repository, service, handlers };
}

function request(id: string, action = "validate", body?: unknown, token = credentials.BLOG_API_READ_TOKEN, query = "") {
  return new Request(`http://localhost:3000/api/internal/blog/posts/${id}/${action}${query}`, { method: action === "preview" ? "GET" : "POST", headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { "Content-Type": "application/json" }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

test("validate accepts a complete draft and checks actual stored image files without publishing", async t => {
  const directory = await mkdtemp(join(tmpdir(), "blog-validate-"));
  t.after(() => rm(directory, { force: true, recursive: true }));
  const fields = completePostFixture();
  const images = [fields.featuredImage!, ...fields.blocks.flatMap(block => block.type === "image" && block.image ? [block.image] : [])];
  await Promise.all(images.map(image => writeFile(join(directory, image.url.split("/").at(-1)!), testPng)));
  let checks = 0;
  const { service, handlers } = store(t, async image => { checks++; await readBlogImage(image.url.split("/").at(-1)!, directory); });
  const post = service.createDraft(fields);
  const response = await handlers.validate(request(post.id), post.id);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data, { valid: true, postId: post.id, revision: 1, errors: [], warnings: [] });
  assert.equal(checks, 5);
  assert.equal(service.get(post.id).status, "draft");
  assert.equal(service.getPublished(post.slug), null);
});

test("invalid draft returns structured field issues rather than publishing or returning an HTTP 422", async t => {
  const { service, handlers } = store(t);
  const post = service.createDraft({ title: "Incomplete draft" });
  const response = await handlers.validate(request(post.id, "validate", {}), post.id);
  assert.equal(response.status, 200);
  const result = (await response.json()).data;
  assert.equal(result.valid, false); assert.equal(result.postId, post.id); assert.equal(result.revision, 1);
  assert.deepEqual(result.warnings, []);
  assert.ok(result.errors.some((issue: { field: string }) => issue.field === "subtitle"));
  assert.ok(result.errors.every((issue: { code: unknown; field: unknown; message: unknown }) => typeof issue.code === "string" && typeof issue.field === "string" && typeof issue.message === "string"));
  assert.deepEqual(service.get(post.id), post);
});

test("validate accepts empty streamed POST bodies from the Next adapter without weakening JSON validation", async t => {
  const { service, handlers } = store(t); const post = service.createDraft(completePostFixture());
  const init = { method: "POST", headers: { Authorization: `Bearer ${credentials.BLOG_API_READ_TOKEN}` }, body: new ReadableStream<Uint8Array>({ start(controller) { controller.close(); } }), duplex: "half" };
  const empty = await handlers.validate(new Request("http://localhost/api/internal/blog/posts/id/validate", init), post.id);
  assert.equal(empty.status, 200); assert.equal((await empty.json()).data.valid, true);
  const nonempty = new Request("http://localhost", { method: "POST", headers: init.headers, body: "not JSON" });
  assert.equal((await handlers.validate(nonempty, post.id)).status, 415);
});

const variations: { name: string; change: (fields: BlogPostFields) => void; field: string }[] = [
  { name: "reordered template", change: fields => { fields.blocks.reverse(); }, field: "blocks" },
  { name: "missing template slot", change: fields => { fields.blocks.pop(); }, field: "blocks" },
  { name: "missing featured image", change: fields => { fields.featuredImage = null; }, field: "featuredImage" },
  { name: "missing internal image", change: fields => { const block = fields.blocks.find(block => block.type === "image")!; if (block.type === "image") block.image = null; }, field: "blocks." },
  { name: "missing featured alt", change: fields => { Reflect.deleteProperty(fields.featuredImage!, "alt"); }, field: "featuredImage" },
  { name: "missing internal alt", change: fields => { const block = fields.blocks.find(block => block.type === "image")!; if (block.type === "image") block.image!.alt = ""; }, field: "blocks." },
  { name: "invalid slug", change: fields => { fields.slug = "Invalid_Slug"; }, field: "slug" },
  { name: "missing required video", change: fields => { fields.video = null; }, field: "video" },
  { name: "H2 instead of H3", change: fields => { const block = fields.blocks.find(block => block.type === "heading")!; if (block.type === "heading") block.level = 2; }, field: "blocks." },
  { name: "empty CTA text", change: fields => { const block = fields.blocks.find(block => block.type === "cta")!; if (block.type === "cta") block.text = ""; }, field: "blocks." },
  { name: "unsafe CTA destination", change: fields => { const block = fields.blocks.find(block => block.type === "cta")!; if (block.type === "cta") block.href = "javascript:alert(1)"; }, field: "blocks." },
  { name: "altered final form", change: fields => { Reflect.set(fields.blocks.at(-1)!, "formId", "unknown-form"); }, field: "blocks." },
  { name: "duplicate image identity", change: fields => { const block = fields.blocks.find(block => block.type === "image")!; if (block.type === "image") block.image = { ...fields.featuredImage!, type: "internal" }; }, field: "blocks" },
];
for (const variant of variations) test(`validate and publish share the same rejection: ${variant.name}`, async t => {
  const { repository, service } = store(t);
  const fields = completePostFixture(); variant.change(fields);
  // Simulate a saved legacy/corrupted row, bypassing only the write-time parser.
  const post = repository.createDraft(fields);
  const result = await service.validate(post.id);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(issue => issue.field.startsWith(variant.field)));
  await assert.rejects(service.publish(post.id, { revision: 1 }), error => error instanceof BlogError && error.status === 422 && JSON.stringify(error.details) === JSON.stringify(result.errors.map(issue => issue.message)));
  assert.deepEqual(service.get(post.id), post);
});

test("required title, subtitle, excerpt and SEO use existing rules without new editorial minimums", async t => {
  const { service } = store(t);
  const post = service.createDraft(completePostFixture());
  for (const field of ["title", "subtitle", "excerpt", "seoTitle", "metaDescription", "focusKeyword"] as const) {
    const result = await validateBlogPost({ ...post, [field]: "" }, ignoreImages);
    assert.equal(result.valid, false); assert.ok(result.errors.some(issue => issue.field === field));
  }
  const short = { ...post, title: "A", subtitle: "A", excerpt: "A", seoTitle: "A", metaDescription: "A", focusKeyword: "A" };
  assert.equal((await validateBlogPost(short, ignoreImages)).valid, true);
});

test("validate checks absent files using the same storage rule as publication", async t => {
  const { service } = store(t, async () => { throw new BlogError(404, "image_not_found", "Not found."); });
  const post = service.createDraft(completePostFixture());
  const result = await service.validate(post.id);
  assert.equal(result.valid, false); assert.equal(result.errors.length, 5);
  assert.ok(result.errors.every(issue => issue.code === "missing_image"));
  await assert.rejects(service.publish(post.id, { revision: 1 }), code("missing_image"));
  assert.deepEqual(service.get(post.id), post);
});

test("validate and preview work with SQLite query_only and never change any persisted post field", async t => {
  const { database, repository, service, handlers } = store(t);
  const post = service.createDraft(completePostFixture());
  const before = database.prepare("SELECT total_changes() AS total").get()!.total;
  const publish = t.mock.method(repository, "publish");
  database.exec("PRAGMA query_only = ON");
  assert.equal((await handlers.validate(request(post.id), post.id)).status, 200);
  assert.equal((await handlers.preview(request(post.id, "preview"), post.id)).status, 200);
  assert.equal(database.prepare("SELECT total_changes() AS total").get()!.total, before);
  assert.equal(publish.mock.callCount(), 0);
  assert.deepEqual(service.get(post.id), post);
  assert.equal(service.listPublished().total, 0);
});

test("validate returns current revision, supports an optional revision guard and rejects stale input", async t => {
  const { service, handlers } = store(t);
  const post = service.createDraft(completePostFixture());
  service.update(post.id, { revision: 1, title: "Current title" });
  const current = await handlers.validate(request(post.id, "validate", { revision: 2 }), post.id);
  assert.equal((await current.json()).data.revision, 2);
  assert.equal((await service.validate(post.id)).revision, 2);
  const stale = await handlers.validate(request(post.id, "validate", { revision: 1 }), post.id);
  assert.equal(stale.status, 409); assert.equal((await stale.json()).error.code, "revision_conflict");
});

test("validate rejects edits made during asynchronous image checks, even without a requested revision", async t => {
  const { repository } = store(t);
  const post = repository.createDraft(completePostFixture()); let changed = false;
  const service = createBlogService(repository, async () => {
    if (changed) return; changed = true;
    repository.update(post.id, { revision: 1, changes: { title: "Concurrent edit" } });
  });
  await assert.rejects(service.validate(post.id), code("revision_conflict"));
  assert.equal(service.get(post.id).revision, 2); assert.equal(service.get(post.id).status, "draft");
});

test("publish retains mandatory revision and atomic protection after successful validation", async t => {
  const { repository, service } = store(t);
  const post = service.createDraft(completePostFixture());
  await assert.rejects(service.publish(post.id, {}), code("invalid_request"));
  await assert.rejects(service.publish(post.id, { revision: 9 }), code("revision_conflict"));
  assert.equal((await service.validate(post.id)).valid, true);
  service.update(post.id, { revision: 1, subtitle: "" });
  await assert.rejects(service.publish(post.id, { revision: 1 }), code("revision_conflict"));
  await assert.rejects(service.publish(post.id, { revision: 2 }), code("publication_validation_failed"));
  const current = service.update(post.id, { revision: 2, subtitle: "Ready again" });
  const publish = repository.publish;
  t.mock.method(repository, "publish", (id: string, revision: number) => { repository.update(id, { revision, changes: { excerpt: "" } }); return publish(id, revision); });
  await assert.rejects(service.publish(post.id, { revision: current.revision }), code("revision_conflict"));
  assert.equal(service.get(post.id).status, "draft");
});

test("HTTP validate accepts READ/WRITE and explicitly rejects PUBLISH, invalid credentials and admin cookies", async t => {
  const { service, handlers } = store(t); const post = service.createDraft(completePostFixture());
  for (const token of [credentials.BLOG_API_READ_TOKEN, credentials.BLOG_API_WRITE_TOKEN]) assert.equal((await handlers.validate(request(post.id, "validate", {}, token), post.id)).status, 200);
  assert.equal((await handlers.validate(request(post.id, "validate", {}, credentials.BLOG_API_PUBLISH_TOKEN), post.id)).status, 403);
  assert.equal((await handlers.validate(request(post.id, "validate", {}, "wrong"), post.id)).status, 401);
  const unauthenticated = new Request("http://localhost/api/internal/blog/posts/id/validate", { method: "POST", headers: { Cookie: "admin-session=not-a-service-token" } });
  assert.equal((await handlers.validate(unauthenticated, post.id)).status, 401);
  assert.equal((await handlers.publish(request(post.id, "publish", { revision: 1 }), post.id)).status, 403);
  assert.deepEqual(service.get(post.id), post);
});

test("validate authenticates before parsing JSON or resolving storage", async () => {
  let resolved = false;
  const handlers = createBlogHandlers(() => { resolved = true; throw new Error("Must not resolve"); }, (request, scope) => requireBlogScope(request, scope, credentials));
  const response = await handlers.validate(new Request("http://localhost/api/internal/blog/posts/id/validate", { method: "POST", body: "not JSON" }), "invalid-id");
  assert.equal(response.status, 401); assert.equal(response.headers.get("www-authenticate"), "Bearer");
  assert.equal(response.headers.get("cache-control"), "private, no-store"); assert.equal(resolved, false);
});

test("validation payloads reject unknown/write fields, malformed JSON, excessive bytes and invalid ids", async t => {
  const { service, handlers } = store(t); const post = service.createDraft(completePostFixture());
  for (const body of [{ revision: 0 }, { revision: "1" }, { status: "published" }, { title: "Must not save" }, { revision: 1, expectedRevision: 1 }]) assert.equal((await handlers.validate(request(post.id, "validate", body), post.id)).status, 400);
  const headers = { Authorization: `Bearer ${credentials.BLOG_API_READ_TOKEN}`, "Content-Type": "application/json" };
  assert.equal((await handlers.validate(new Request("http://localhost", { method: "POST", headers, body: "{" }), post.id)).status, 400);
  assert.equal((await handlers.validate(request(post.id, "validate", { unknown: "x".repeat(513 * 1024) }), post.id)).status, 413);
  assert.equal((await handlers.validate(new Request("http://localhost", { method: "POST", headers: { ...headers, "Content-Type": "text/plain" }, body: "{}" }), post.id)).status, 415);
  assert.equal((await handlers.validate(request("invalid-id"), "invalid-id")).status, 400);
  const missingId = randomUUID(); assert.equal((await handlers.validate(request(missingId), missingId)).status, 404);
  assert.deepEqual(service.get(post.id), post);
});

test("preview returns a protected saved-revision admin URL without cookies or public draft access", async t => {
  const { service, handlers } = store(t); const post = service.createDraft(completePostFixture());
  const response = await handlers.preview(request(post.id, "preview"), post.id);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data, { postId: post.id, revision: 1, status: "draft", previewUrl: `http://localhost:3000/admin/blog/${post.id}/preview?revision=1`, requiresAdminLogin: true });
  assert.equal(response.headers.get("set-cookie"), null); assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(service.getPublished(post.slug), null); assert.deepEqual(service.get(post.id), post);
});

test("preview missing post, stale revision, invalid query and unauthenticated access fail safely", async t => {
  const { service, handlers } = store(t); const post = service.createDraft(completePostFixture()); const missing = randomUUID();
  assert.equal((await handlers.preview(request(missing, "preview"), missing)).status, 404);
  assert.equal((await handlers.preview(request(post.id, "preview", undefined, "wrong"), post.id)).status, 401);
  for (const query of ["?revision=0", "?revision=1&revision=1", "?token=not-accepted", "?revision=1.5"]) assert.equal((await handlers.preview(request(post.id, "preview", undefined, undefined, query), post.id)).status, 400);
  service.update(post.id, { revision: 1, title: "Updated" });
  assert.equal((await handlers.preview(request(post.id, "preview", undefined, undefined, "?revision=1"), post.id)).status, 409);
  assert.equal((await handlers.preview(request(post.id, "preview", undefined, undefined, "?revision=2"), post.id)).status, 200);
});

test("preview links use configured admin origin rather than request or forwarded hosts", async t => {
  const { service } = store(t); const post = service.createDraft(completePostFixture());
  const handlers = createBlogHandlers(() => service, (request, scope) => requireBlogScope(request, scope, credentials), () => "https://automasoluct.com");
  const response = await handlers.preview(new Request(`http://localhost:3000/api/internal/blog/posts/${post.id}/preview`, { headers: { Authorization: `Bearer ${credentials.BLOG_API_READ_TOKEN}`, Host: "attacker.test", "X-Forwarded-Host": "attacker.test", "X-Forwarded-Proto": "http" } }), post.id);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.previewUrl, `https://automasoluct.com/admin/blog/${post.id}/preview?revision=1`);
});

test("storage infrastructure failures do not masquerade as editorial results or reveal paths", async t => {
  const log = t.mock.method(console, "error", () => {});
  const { service, handlers } = store(t, async () => { throw new Error("private storage path must not leak"); });
  const post = service.createDraft(completePostFixture());
  const response = await handlers.validate(request(post.id), post.id);
  assert.equal(response.status, 500); assert.ok(!JSON.stringify(await response.json()).includes("private storage path"));
  assert.ok(!JSON.stringify(log.mock.calls.map(call => call.arguments)).includes("private storage path"));
  assert.deepEqual(service.get(post.id), post);
});
