import assert from "node:assert/strict";
import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { test, type TestContext } from "node:test";

import { requireBlogScope } from "../../lib/blog/auth.ts";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { BLOG_MIGRATIONS } from "../../lib/blog/migrations.ts";
import { BlogError } from "../../lib/blog/errors.ts";
import { createBlogHandlers } from "../../lib/blog/handlers.ts";
import { readBlogImage } from "../../lib/blog/media.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createBlogService } from "../../lib/blog/service.ts";
import { parseCreateDraft, parsePostQuery, parseUpdatePost } from "../../lib/blog/validation.ts";
import { completePostFixture, imageFixture, testPng } from "./fixtures.ts";

const credentials = { BLOG_API_READ_TOKEN: "test-read-".padEnd(48, "r"), BLOG_API_WRITE_TOKEN: "test-write-".padEnd(48, "w"), BLOG_API_PUBLISH_TOKEN: "test-publish-".padEnd(48, "p") };
const errorCode = (code: string) => (error: unknown) => error instanceof BlogError && error.code === code;

function store(t: TestContext) {
  const database = openBlogDatabase(":memory:");
  t.after(() => database.close());
  const repository = createPostRepository(database);
  const service = createBlogService(repository, async () => {});
  const handlers = createBlogHandlers(() => service, (request, scope) => requireBlogScope(request, scope, credentials));
  return { database, repository, service, handlers };
}

function request(method = "GET", body?: unknown, token = credentials.BLOG_API_WRITE_TOKEN, path = "/api/internal/blog/posts") {
  return new Request(`http://localhost${path}`, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

test("draft creation persists every field and preserves block ordering across reopening", async t => {
  const directory = await mkdtemp(join(tmpdir(), "blog-persistence-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filename = join(directory, "blog.sqlite");
  const first = openBlogDatabase(filename);
  const repository = createPostRepository(first);
  const fields = parseCreateDraft({ ...completePostFixture(), blocks: [{ id: "intro", type: "text", content: "First\n\nSecond — ação" }, { id: "section", type: "heading", level: 2, content: "Third" }] });
  const post = repository.createDraft(fields);
  assert.equal(post.status, "draft");
  assert.equal(post.revision, 1);
  assert.equal(post.publishedAt, null);
  first.close();
  const reopened = openBlogDatabase(filename);
  t.after(() => reopened.close());
  assert.deepEqual(createPostRepository(reopened).get(post.id), post);
  assert.equal(reopened.prepare("SELECT count(*) AS count FROM blog_migrations").get()?.count, BLOG_MIGRATIONS.length);
});

test("drafts never enter public queries and publication dates control listing order", t => {
  const { repository, database } = store(t);
  const draft = repository.createDraft(parseCreateDraft({ title: "Private draft" }));
  assert.equal(repository.getPublishedBySlug(draft.slug), null);
  assert.equal(repository.list({ status: "published", page: 1, pageSize: 10 }).total, 0);
  const earlier = repository.createDraft(parseCreateDraft({ title: "Earlier" }));
  const later = repository.createDraft(parseCreateDraft({ title: "Later" }));
  repository.publish(earlier.id, 1);
  repository.publish(later.id, 1);
  database.prepare("UPDATE blog_posts SET published_at = ? WHERE id = ?").run("2026-01-01T00:00:00.000Z", earlier.id);
  database.prepare("UPDATE blog_posts SET published_at = ? WHERE id = ?").run("2026-02-01T00:00:00.000Z", later.id);
  const page = repository.list({ status: "published", page: 1, pageSize: 1 });
  assert.equal(page.total, 2);
  assert.equal(page.items[0].id, later.id);
  assert.equal("blocks" in page.items[0], false);
  assert.equal(repository.list({ status: "published", page: 2, pageSize: 1 }).items[0].id, earlier.id);
});

test("slugs are unique and content containing SQL remains literal data", t => {
  const { repository, service } = store(t);
  const title = "Robert'); DROP TABLE blog_posts;--";
  const first = service.createDraft({ title, slug: "safe-slug" });
  assert.equal(repository.get(first.id).title, title);
  assert.throws(() => service.createDraft({ title: "Other", slug: "safe-slug" }), errorCode("slug_conflict"));
  assert.equal(service.list({ page: 1, pageSize: 10 }).total, 1);
});

test("stale updates cannot overwrite a newer revision", t => {
  const { service } = store(t);
  const draft = service.createDraft({ title: "First" });
  const updated = service.update(draft.id, { revision: 1, title: "Second" });
  assert.equal(updated.revision, 2);
  assert.throws(() => service.update(draft.id, { revision: 1, title: "Lost update" }), errorCode("revision_conflict"));
  assert.equal(service.get(draft.id).title, "Second");
});

test("editing published content requires explicit withdrawal; no update auto-publishes", t => {
  const { repository, service } = store(t);
  const draft = service.createDraft({ title: "First" });
  const published = repository.publish(draft.id, draft.revision);
  assert.throws(() => service.update(draft.id, { revision: published.revision, title: "Unapproved" }), errorCode("published_post_requires_draft"));
  const withdrawn = service.update(draft.id, { revision: published.revision, status: "draft", title: "Work in progress" });
  assert.equal(withdrawn.status, "draft");
  assert.equal(withdrawn.publishedAt, null);
  assert.equal(service.getPublished(withdrawn.slug), null);
});

test("request validation rejects read-only fields, invalid blocks and dangerous URLs", () => {
  for (const field of ["status", "id", "revision", "createdAt", "publishedAt"]) assert.throws(() => parseCreateDraft({ title: "Example", [field]: "published" }), errorCode("invalid_request"));
  assert.throws(() => parseUpdatePost({ revision: 1, status: "published" }), errorCode("invalid_request"));
  assert.throws(() => parseUpdatePost({ title: "Missing revision" }), errorCode("invalid_request"));
  assert.throws(() => parseCreateDraft({ title: "Example", blocks: [{ id: "intro", type: "script", content: "unsafe" }] }), errorCode("invalid_request"));
  assert.throws(() => parseCreateDraft({ title: "Example", blocks: [{ id: "intro", type: "text", content: "First" }, { id: "intro", type: "text", content: "Second" }] }), errorCode("invalid_request"));
  for (const href of ["javascript:alert(1)", "//evil.example", "/\\evil.example", "data:text/html,x"]) assert.throws(() => parseCreateDraft({ title: "Example", blocks: [{ id: "cta", type: "cta", text: "Contact", label: "Contact", href }] }), errorCode("invalid_request"));
  const image = imageFixture("featured");
  assert.throws(() => parseCreateDraft({ title: "Example", featuredImage: { ...image, url: "/uploads/blog/../../.env" } }), errorCode("invalid_request"));
  assert.throws(() => parseCreateDraft({ title: "Example", video: { provider: "youtube", id: "<script>", title: "Video" } }), errorCode("invalid_request"));
});

test("pagination is bounded and tag normalization preserves labels", () => {
  assert.deepEqual(parsePostQuery(new URLSearchParams()), { page: 1, pageSize: 20 });
  for (const query of ["page=0", "page=-1", "pageSize=101", "status=all", "query=unsafe"]) assert.throws(() => parsePostQuery(new URLSearchParams(query)), errorCode("invalid_request"));
  assert.deepEqual(parseCreateDraft({ title: "Ação & automação", tags: ["Jobber", "jobber", " API "] }).tags, ["Jobber", "API"]);
  assert.equal(parseCreateDraft({ title: "Ação & automação" }).slug, "acao-automacao");
});

test("authentication fails closed and separates read, write and publish permissions", () => {
  assert.throws(() => requireBlogScope(request(), "posts:read", {}), errorCode("auth_not_configured"));
  assert.throws(() => requireBlogScope(request(), "posts:read", { BLOG_API_READ_TOKEN: "short" }), errorCode("auth_not_configured"));
  assert.throws(() => requireBlogScope(new Request("http://localhost"), "posts:read", credentials), errorCode("unauthorized"));
  assert.throws(() => requireBlogScope(request("GET", undefined, "incorrect"), "posts:read", credentials), errorCode("unauthorized"));
  assert.throws(() => requireBlogScope(request("GET", undefined, credentials.BLOG_API_READ_TOKEN), "posts:write", credentials), errorCode("forbidden"));
  assert.throws(() => requireBlogScope(request(), "posts:publish", credentials), errorCode("forbidden"));
  assert.throws(() => requireBlogScope(request("GET", undefined, credentials.BLOG_API_PUBLISH_TOKEN), "posts:write", credentials), errorCode("forbidden"));
  assert.equal(requireBlogScope(request(), "posts:write", credentials).kind, "service");
});

test("HTTP authentication happens before opening storage or parsing input", async () => {
  let resolved = false;
  const handlers = createBlogHandlers(() => { resolved = true; throw new Error("Should not open storage"); }, (request, scope) => requireBlogScope(request, scope, credentials));
  const response = await handlers.create(new Request("http://localhost/api/internal/blog/posts", { method: "POST", body: "invalid" }));
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("www-authenticate"), "Bearer");
  assert.equal(resolved, false);
});

test("HTTP draft lifecycle returns stable errors, revisions and protected reads", async t => {
  const { handlers } = store(t);
  const created = await handlers.create(request("POST", { title: "HTTP draft" }));
  assert.equal(created.status, 201);
  const { data: draft } = await created.json();
  assert.equal(draft.status, "draft");
  assert.equal(created.headers.get("location"), `/api/internal/blog/posts/${draft.id}`);
  assert.equal((await handlers.get(request(), draft.id)).status, 200);
  assert.equal((await handlers.get(request(), randomUUID())).status, 404);
  assert.equal((await handlers.get(request(), "bad-id")).status, 400);
  assert.equal((await handlers.list(request("GET", undefined, credentials.BLOG_API_READ_TOKEN))).status, 200);
  assert.equal((await handlers.update(request("PATCH", { revision: 1, title: "Updated" }), draft.id)).status, 200);
  assert.equal((await handlers.update(request("PATCH", { revision: 1, title: "Stale" }), draft.id)).status, 409);
  assert.equal((await handlers.publish(request("POST", { revision: 2 }), draft.id)).status, 403);
  assert.equal((await handlers.update(request("PATCH", { revision: 2, status: "published" }), draft.id)).status, 400);
});

test("HTTP rejects malformed, oversized and non-JSON bodies", async t => {
  const { handlers } = store(t);
  const headers = { Authorization: `Bearer ${credentials.BLOG_API_WRITE_TOKEN}`, "Content-Type": "application/json" };
  assert.equal((await handlers.create(new Request("http://localhost", { method: "POST", headers, body: "{" }))).status, 400);
  assert.equal((await handlers.create(new Request("http://localhost", { method: "POST", headers: { ...headers, "Content-Type": "text/plain" }, body: "{}" }))).status, 415);
  assert.equal((await handlers.create(request("POST", { title: "A".repeat(513 * 1024) }))).status, 413);
});

test("image storage accepts images and rejects traversal, mismatched data and symlinks outside storage", async t => {
  const directory = await mkdtemp(join(tmpdir(), "blog-media-"));
  const outside = await mkdtemp(join(tmpdir(), "blog-outside-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  t.after(() => rm(outside, { recursive: true, force: true }));
  const image = imageFixture();
  const name = image.url.split("/").at(-1)!;
  await writeFile(join(directory, name), testPng);
  assert.equal((await readBlogImage(name, directory)).contentType, "image/png");
  await assert.rejects(() => readBlogImage("../../.env", directory), errorCode("image_not_found"));
  await assert.rejects(() => readBlogImage(`${randomUUID()}.svg`, directory), errorCode("image_not_found"));
  await assert.rejects(() => readBlogImage(`${randomUUID()}.png`, directory), errorCode("image_not_found"));
  const fake = `${randomUUID()}.jpg`;
  await writeFile(join(directory, fake), "<script>not an image</script>");
  await assert.rejects(() => readBlogImage(fake, directory), errorCode("image_not_found"));
  const secret = join(outside, "outside.png");
  await writeFile(secret, testPng);
  const link = `${randomUUID()}.png`;
  await symlink(secret, join(directory, link));
  await assert.rejects(() => readBlogImage(link, directory), errorCode("image_not_found"));
});
