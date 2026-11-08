import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { adminCookie, createAdminAuth, getAdminConfig } from "../../lib/blog/admin/auth.ts";
import { emptyAdminBlocks, parseEditorFields, parseEditorVideo, toEditorFields } from "../../lib/blog/admin/editor.ts";
import { adminListQuery, createAdminHandlers, getAdminPreview } from "../../lib/blog/admin/handlers.ts";
import { hashAdminPassword, verifyAdminPassword } from "../../lib/blog/admin/password.ts";
import { requireBlogScope } from "../../lib/blog/auth.ts";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { BLOG_MIGRATIONS } from "../../lib/blog/migrations.ts";
import { BlogError } from "../../lib/blog/errors.ts";
import { createBlogHandlers } from "../../lib/blog/handlers.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createBlogService } from "../../lib/blog/service.ts";
import { BLOG_TEMPLATE } from "../../lib/blog/template.ts";
import { completePostFixture } from "./fixtures.ts";

const password = "test-only-admin-password-123";
const passwordHash = await hashAdminPassword(password);
const environment = { BLOG_ADMIN_LOGIN: "editor@example.test", BLOG_ADMIN_PASSWORD_HASH: passwordHash, BLOG_ADMIN_ORIGIN: "https://admin.example.test" };
const config = getAdminConfig(environment);
const code = (expected: string) => (error: unknown) => error instanceof BlogError && error.code === expected;

function store(t: TestContext, realPassword = false) {
  const database = openBlogDatabase(":memory:");
  t.after(() => database.close());
  const repository = createPostRepository(database);
  const service = createBlogService(repository, async () => {});
  let time = Date.now();
  const auth = createAdminAuth(database, config, () => time, realPassword ? verifyAdminPassword : async value => value === password);
  const handlers = createAdminHandlers(() => service, () => config, () => auth);
  return { database, repository, service, auth, handlers, advance: (ms: number) => { time += ms; } };
}

async function session(auth: ReturnType<typeof createAdminAuth>) {
  const result = await auth.login(config.login, password);
  return { cookie: `${config.cookieName}=${result.token}`, csrf: result.session.csrfToken, token: result.token };
}

function request(path: string, method = "GET", body?: unknown, current?: { cookie: string; csrf: string }, overrides: HeadersInit = {}) {
  return new Request(`${config.origin}${path}`, { method, headers: { Origin: config.origin, ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...(current ? { Cookie: current.cookie, "X-CSRF-Token": current.csrf } : {}), ...overrides }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

test("admin valid login verifies scrypt, sets secure HttpOnly cookie and stores only a session digest", async t => {
  const { auth, handlers, database } = store(t, true);
  const response = await handlers.login(request("/api/admin/login", "POST", { login: "EDITOR@example.test", password }));
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie")!;
  assert.match(cookie, /__Host-blog_admin=/); assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/); assert.match(cookie, /Secure/); assert.match(cookie, /Max-Age=28800/);
  const token = cookie.split(";", 1)[0].split("=")[1];
  assert.equal(auth.session(token)?.login, config.login);
  const row = database.prepare("SELECT * FROM blog_admin_sessions").get()!;
  assert.notEqual(row.token_hash, token); assert.equal(String(row.token_hash).length, 64);
  assert.ok(!(await response.text()).includes(token)); assert.notEqual(passwordHash, password);
});

test("admin invalid username and password fail without revealing the valid identifier", async t => {
  const { handlers } = store(t, true);
  for (const fields of [{ login: config.login, password: "incorrect" }, { login: "missing@example.test", password }]) {
    const response = await handlers.login(request("/api/admin/login", "POST", fields));
    assert.equal(response.status, 401); assert.equal(response.headers.get("set-cookie"), null);
    assert.equal((await response.json()).error.code, "invalid_credentials");
  }
});

test("admin configuration fails closed, requires a hash and permits HTTP only on loopback", () => {
  for (const env of [{}, { ...environment, BLOG_ADMIN_PASSWORD_HASH: password }, { ...environment, BLOG_ADMIN_ORIGIN: "http://admin.example.test" }, { ...environment, BLOG_ADMIN_ORIGIN: "https://admin.example.test/path" }]) assert.throws(() => getAdminConfig(env), code("admin_not_configured"));
  const local = getAdminConfig({ ...environment, BLOG_ADMIN_ORIGIN: "http://localhost:3000" });
  assert.equal(local.secure, false); assert.doesNotMatch(adminCookie(local, "test"), /; Secure/);
});

test("the admin migration upgrades a version-1 database without changing existing posts", async t => {
  const directory = await mkdtemp(join(tmpdir(), "blog-admin-migration-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filename = join(directory, "blog.sqlite");
  const old = new DatabaseSync(filename);
  old.exec("CREATE TABLE blog_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL) STRICT");
  old.exec(BLOG_MIGRATIONS[0].sql);
  old.prepare("INSERT INTO blog_migrations VALUES (1, ?)").run(new Date().toISOString());
  const original = createPostRepository(old).createDraft(completePostFixture());
  old.close();
  const upgraded = openBlogDatabase(filename);
  try {
    assert.deepEqual(createPostRepository(upgraded).get(original.id), original);
    assert.equal(upgraded.prepare("SELECT count(*) AS count FROM blog_admin_sessions").get()?.count, 0);
    assert.equal(upgraded.prepare("SELECT count(*) AS count FROM blog_migrations").get()?.count, BLOG_MIGRATIONS.length);
  } finally { upgraded.close(); }
});

test("admin requests without a session or with only a service bearer cannot read or mutate posts", async t => {
  const { handlers } = store(t);
  for (const response of [await handlers.list(request("/api/admin/blog/posts")), await handlers.create(request("/api/admin/blog/posts", "POST", { title: "Private" })), await handlers.list(request("/api/admin/blog/posts", "GET", undefined, undefined, { Authorization: "Bearer service-token" }))]) assert.equal(response.status, 401);
});

test("admin mutations require the exact configured Origin and session CSRF token, including logout", async t => {
  const { handlers, auth } = store(t); const current = await session(auth);
  const invalidHeaders: Record<string, string>[] = [{ Origin: "https://attacker.test" }, { Origin: "null" }, { Origin: "" }, { "X-CSRF-Token": "wrong" }, { "Sec-Fetch-Site": "cross-site" }];
  for (const headers of invalidHeaders) {
    assert.equal((await handlers.create(request("/api/admin/blog/posts", "POST", { title: "Blocked" }, current, headers))).status, 403);
    assert.equal((await handlers.logout(request("/api/admin/logout", "POST", undefined, current, headers))).status, 403);
  }
  assert.equal((await handlers.login(request("/api/admin/login", "POST", { login: config.login, password }, undefined, { Origin: "https://attacker.test" }))).status, 403);
});

test("logout revokes the server session and clears the HttpOnly cookie", async t => {
  const { handlers, auth } = store(t); const current = await session(auth);
  const response = await handlers.logout(request("/api/admin/logout", "POST", undefined, current));
  assert.equal(response.status, 200); assert.match(response.headers.get("set-cookie")!, /Max-Age=0/);
  assert.equal(auth.session(current.token), null);
  assert.equal((await handlers.list(request("/api/admin/blog/posts", "GET", undefined, current))).status, 401);
});

test("sessions expire and changing administrator credentials invalidates existing sessions", async t => {
  const { database, auth, advance } = store(t); const current = await session(auth);
  const rotated = createAdminAuth(database, getAdminConfig({ ...environment, BLOG_ADMIN_LOGIN: "new-editor@example.test" }));
  assert.equal(rotated.session(current.token), null);
  advance(8 * 60 * 60 * 1000 + 1); assert.equal(auth.session(current.token), null);
});

test("the persisted login rate limit blocks further guesses and resets after its window", async t => {
  const { auth, advance } = store(t);
  for (let i = 0; i < 10; i++) await assert.rejects(() => auth.login(config.login, "wrong"), code("invalid_credentials"));
  await assert.rejects(() => auth.login(config.login, password), code("login_rate_limited"));
  advance(15 * 60 * 1000 + 1); assert.ok((await auth.login(config.login, password)).token);
});

test("dashboard listing searches title/slug literally, filters status, paginates and sorts by updated time", async t => {
  const { handlers, service, database, auth } = store(t); const current = await session(auth);
  const a = service.createDraft({ title: "100% connected", slug: "connected-ops" });
  const b = service.createDraft(completePostFixture()); await service.publish(b.id, { revision: 1 });
  database.prepare("UPDATE blog_posts SET updated_at = ? WHERE id = ?").run("2099-01-01T00:00:00.000Z", a.id);
  for (const q of ["100%", "connected-ops"]) {
    const response = await handlers.list(request(`/api/admin/blog/posts?q=${encodeURIComponent(q)}`, "GET", undefined, current));
    assert.equal(response.status, 200); assert.equal((await response.json()).data.items[0].id, a.id);
  }
  assert.equal((await (await handlers.list(request("/api/admin/blog/posts?status=published", "GET", undefined, current))).json()).data.total, 1);
  assert.equal(service.list(adminListQuery(new URLSearchParams())).items[0].id, a.id);
  assert.equal(service.list(adminListQuery(new URLSearchParams("q=%27%20OR%201%3D1--"))).total, 0);
});

test("creating and opening an editor prepares all 26 fixed blocks without publishing", async t => {
  const { handlers, service, auth } = store(t); const current = await session(auth);
  const response = await handlers.create(request("/api/admin/blog/posts", "POST", { title: "New editorial draft" }, current));
  assert.equal(response.status, 201); const post = (await response.json()).data;
  assert.equal(post.status, "draft"); assert.equal(post.revision, 1); assert.equal(post.blocks.length, 26);
  const opened = await handlers.get(request(`/api/admin/blog/posts/${post.id}`, "GET", undefined, current), post.id);
  assert.equal(opened.status, 200); const data = (await opened.json()).data;
  assert.deepEqual(data.fields.blocks.map((block: { id: string }) => block.id), BLOG_TEMPLATE.slots.map(slot => slot.id));
  assert.equal(service.getPublished(post.slug), null);
});

test("saving a draft preserves paragraphs, nullable pending images and advances expectedRevision", async t => {
  const { handlers, service, auth } = store(t); const current = await session(auth);
  const post = service.createDraft({ title: "Editable draft", blocks: emptyAdminBlocks() }); const fields = toEditorFields(post);
  const block = fields.blocks[0]; assert.equal(block.type, "text");
  if (block.type === "text") block.content = "First paragraph.\n\nSecond paragraph.\nA line break.";
  const response = await handlers.update(request(`/api/admin/blog/posts/${post.id}`, "PATCH", { expectedRevision: 1, fields }, current), post.id);
  assert.equal(response.status, 200); const updated = (await response.json()).data;
  assert.equal(updated.revision, 2); assert.equal(updated.status, "draft"); assert.equal(updated.blocks[0].content, block.type === "text" ? block.content : "");
  assert.equal(updated.blocks[4].image, null); assert.equal(updated.blocks.length, 26);
});

test("concurrent draft edits return revision_conflict without overwriting the saved post", async t => {
  const { handlers, service, auth } = store(t); const current = await session(auth);
  const post = service.createDraft(completePostFixture()); const fields = toEditorFields(post);
  service.update(post.id, { revision: 1, title: "Saved by another editor" });
  fields.title = "Stale edit";
  const response = await handlers.update(request("/api/admin/blog/posts/id", "PATCH", { expectedRevision: 1, fields }, current), post.id);
  assert.equal(response.status, 409); assert.equal((await response.json()).error.code, "revision_conflict"); assert.equal(service.get(post.id).title, "Saved by another editor");
});

test("admin save rejects reordered, removed, retyped blocks, H2 and altered final forms server-side", async t => {
  const { handlers, service, auth } = store(t); const current = await session(auth); const post = service.createDraft(completePostFixture());
  const initial = toEditorFields(post);
  for (const blocks of [[...initial.blocks].reverse(), initial.blocks.slice(1), initial.blocks.map(block => block.type === "heading" ? { ...block, level: 2 } : block), initial.blocks.map(block => block.type === "form" ? { ...block, formId: "other" } : block)]) {
    const response = await handlers.update(request("/api/admin/blog/posts/id", "PATCH", { expectedRevision: 1, fields: { ...initial, blocks } }, current), post.id);
    assert.equal(response.status, 400); assert.equal(service.get(post.id).revision, 1);
  }
});

test("private preview uses the exact saved revision and drafts remain absent from public queries", t => {
  const { service } = store(t); const post = service.createDraft(completePostFixture());
  assert.equal(getAdminPreview(service, post.id, 1).id, post.id); assert.equal(service.getPublished(post.slug), null);
  service.update(post.id, { revision: 1, title: "Updated" });
  assert.throws(() => getAdminPreview(service, post.id, 1), code("revision_conflict")); assert.equal(getAdminPreview(service, post.id, 2).title, "Updated");
});

test("publication requires explicit confirmation, complete editorial content and the current revision", async t => {
  const { service, handlers, auth } = store(t); const current = await session(auth);
  const incomplete = service.createDraft({ title: "Incomplete", blocks: emptyAdminBlocks() });
  assert.equal((await handlers.publish(request("/api/admin/blog/posts/id/publish", "POST", { expectedRevision: 1, confirmation: incomplete.slug }, current), incomplete.id)).status, 422);
  const post = service.createDraft(completePostFixture());
  assert.equal((await handlers.publish(request("/api/admin/blog/posts/id/publish", "POST", { expectedRevision: 1 }, current), post.id)).status, 400);
  const result = await handlers.publish(request("/api/admin/blog/posts/id/publish", "POST", { expectedRevision: 1, confirmation: post.slug }, current), post.id);
  assert.equal(result.status, 200); assert.equal(service.get(post.id).status, "published"); assert.equal(service.get(post.id).revision, 2);
});

test("published posts cannot be silently saved; explicit withdrawal makes them editable drafts", async t => {
  const { service, handlers, auth } = store(t); const current = await session(auth);
  const post = service.createDraft(completePostFixture()); const published = await service.publish(post.id, { revision: 1 });
  const fields = toEditorFields(published);
  assert.equal((await handlers.update(request("/api/admin/blog/posts/id", "PATCH", { expectedRevision: 2, fields }, current), post.id)).status, 409);
  const response = await handlers.withdraw(request("/api/admin/blog/posts/id/draft", "POST", { expectedRevision: 2, confirmation: post.slug }, current), post.id);
  assert.equal(response.status, 200); assert.equal(service.get(post.id).status, "draft"); assert.equal(service.get(post.id).revision, 3); assert.equal(service.getPublished(post.slug), null);
});

test("admin deletion requires exact slug confirmation and expectedRevision, and removes only the chosen post", async t => {
  const { service, handlers, auth } = store(t); const current = await session(auth);
  const a = service.createDraft(completePostFixture()); const b = service.createDraft(completePostFixture());
  assert.equal((await handlers.remove(request("/api/admin/blog/posts/id", "DELETE", { expectedRevision: 1, confirmation: "wrong" }, current), a.id)).status, 400);
  service.update(a.id, { revision: 1, title: "Changed" });
  assert.equal((await handlers.remove(request("/api/admin/blog/posts/id", "DELETE", { expectedRevision: 1, confirmation: a.slug }, current), a.id)).status, 409);
  assert.equal((await handlers.remove(request("/api/admin/blog/posts/id", "DELETE", { expectedRevision: 2, confirmation: a.slug }, current), a.id)).status, 200);
  assert.throws(() => service.get(a.id), code("post_not_found")); assert.equal(service.get(b.id).id, b.id);
});

test("session cookies do not authenticate the service-token API and no DELETE handler is added there", async t => {
  const { service, auth } = store(t); const current = await session(auth);
  const handlers = createBlogHandlers(() => service, (req, scope) => requireBlogScope(req, scope, { BLOG_API_WRITE_TOKEN: "service-only-".padEnd(48, "t") }));
  assert.equal((await handlers.create(request("/api/internal/blog/posts", "POST", { title: "Blocked" }, current))).status, 401);
  assert.equal("remove" in handlers, false);
});

test("video URL and image references are normalized and validated without accepting external image hosts", t => {
  const { service } = store(t); const fields = toEditorFields(service.createDraft(completePostFixture()));
  assert.equal(parseEditorVideo("https://youtu.be/AAAAAAAAAAA", "Title")?.id, "AAAAAAAAAAA");
  assert.equal(parseEditorVideo("https://vimeo.com/12345678", "Title")?.provider, "vimeo");
  for (const url of ["javascript:alert(1)", "http://youtube.com/watch?v=AAAAAAAAAAA", "https://youtube.com.attacker.test/watch?v=AAAAAAAAAAA", "https://www.youtube.com:444/watch?v=AAAAAAAAAAA"]) assert.throws(() => parseEditorVideo(url, "Title"), code("invalid_request"));
  assert.throws(() => parseEditorFields({ ...fields, featuredImage: { url: "https://attacker.test/image.png", alt: "Image" } }), code("invalid_request"));
  assert.throws(() => parseEditorFields({ ...fields, blocks: fields.blocks.map(block => block.type === "cta" ? { ...block, href: "javascript:alert(1)" } : block) }), code("invalid_request"));
});
