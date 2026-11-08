import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DatabaseSync } from "node:sqlite";
import sharp from "sharp";

import { createAdminAuth, getAdminConfig } from "../../lib/blog/admin/auth.ts";
import { requireBlogScope } from "../../lib/blog/auth.ts";
import { blogUploadLimits } from "../../lib/blog/config.ts";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { BlogError } from "../../lib/blog/errors.ts";
import { blogImageResponse } from "../../lib/blog/media.ts";
import { createMediaHandlers } from "../../lib/blog/media-handlers.ts";
import { createMediaRepository } from "../../lib/blog/media-repository.ts";
import { createMediaService, parseMediaQuery, type StoreBlogImageInput } from "../../lib/blog/media-service.ts";
import { BLOG_MIGRATIONS } from "../../lib/blog/migrations.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createBlogService } from "../../lib/blog/service.ts";

const png = await sharp({ create: { width: 40, height: 24, channels: 4, background: "#0a4ee4" } }).png().toBuffer();
const image = (changes: Partial<StoreBlogImageInput> = {}): StoreBlogImageInput => ({ bytes: png, mimeType: "image/png", alt: "Fluxo de automação", type: "internal", originalName: "workflow.png", ...changes });
const code = (value: string) => (error: unknown) => error instanceof BlogError && error.code === value;
const config = getAdminConfig({ BLOG_ADMIN_LOGIN: "media@example.test", BLOG_ADMIN_PASSWORD_HASH: `scrypt:131072:8:1:${"a".repeat(32)}:${"b".repeat(128)}`, BLOG_ADMIN_ORIGIN: "https://admin.example.test" });

async function store(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "blog-media-test-"));
  const database = openBlogDatabase(join(directory, "blog.sqlite"));
  t.after(async () => { database.close(); await rm(directory, { recursive: true, force: true }); });
  const repository = createMediaRepository(database);
  const service = createMediaService(repository, join(directory, "uploads"));
  const posts = createBlogService(createPostRepository(database), async () => {});
  const auth = createAdminAuth(database, config, Date.now, async value => value === "test-only-password");
  const logged = await auth.login(config.login, "test-only-password");
  const handlers = createMediaHandlers(() => service, (request, write) => { auth.require(request, write); });
  const headers = { Origin: config.origin, Cookie: `${config.cookieName}=${logged.token}`, "X-CSRF-Token": logged.session.csrfToken };
  function request(method = "GET", body?: BodyInit, override: HeadersInit = {}, path = "/api/admin/blog/media") {
    return new Request(`${config.origin}${path}`, { method, headers: { ...headers, ...override }, ...(body === undefined ? {} : { body }) });
  }
  function form(file = png, type = "image/png", name = "workflow.png") { const data = new FormData(); data.set("file", new File([new Uint8Array(file)], name, { type })); data.set("alt", "Diagrama de operação"); data.set("type", "featured"); return data; }
  return { directory, database, repository, service, posts, handlers, request, form, headers };
}

test("media upload accepts and fully decodes PNG, JPEG and WebP without changing original bytes", async t => {
  const { service, directory } = await store(t);
  for (const [format, mime] of [["png", "image/png"], ["jpeg", "image/jpeg"], ["webp", "image/webp"]] as const) {
    const bytes = await sharp(png).toFormat(format).toBuffer();
    const media = await service.storeBlogImage(image({ bytes, mimeType: mime }));
    assert.equal(media.mimeType, mime); assert.equal(media.width, 40); assert.equal(media.height, 24); assert.equal(media.size, bytes.length);
    assert.match(media.fileName, /^[a-f0-9-]{36}\.(png|jpg|webp)$/); assert.equal(media.url, `/uploads/blog/${media.fileName}`);
    assert.deepEqual(await readFile(join(directory, "uploads", media.fileName)), bytes);
  }
});

test("media metadata persists across reopening SQLite, including alt, usage type and dimensions", async t => {
  const { service, directory } = await store(t);
  const media = await service.storeBlogImage(image({ type: "other" }));
  const reopened = openBlogDatabase(join(directory, "blog.sqlite"));
  try { assert.deepEqual(createMediaRepository(reopened).get(media.id), media); } finally { reopened.close(); }
});

test("media migration upgrades version two without changing posts or active administrator sessions", async t => {
  const directory = await mkdtemp(join(tmpdir(), "blog-media-upgrade-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, "blog.sqlite"), old = new DatabaseSync(path);
  old.exec("CREATE TABLE blog_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL) STRICT");
  for (const migration of BLOG_MIGRATIONS.slice(0, 2)) { old.exec(migration.sql); old.prepare("INSERT INTO blog_migrations VALUES (?, ?)").run(migration.version, new Date().toISOString()); }
  const post = createBlogService(createPostRepository(old), async () => {}).createDraft({ title: "Existing draft" });
  old.prepare("INSERT INTO blog_admin_sessions VALUES (?, ?, ?, ?, ?)").run("token-digest", "version", "csrf", 1, 99);
  old.close();
  const next = openBlogDatabase(path);
  try { assert.deepEqual(createPostRepository(next).get(post.id), post); assert.equal(next.prepare("SELECT count(*) AS n FROM blog_admin_sessions").get()?.n, 1); assert.equal(createMediaRepository(next).list({ page: 1, pageSize: 12 }).total, 0); } finally { next.close(); }
});

test("media rejects unsupported MIME, SVG/executable data, mismatched signatures and truncated real headers", async t => {
  const { service } = await store(t);
  await assert.rejects(service.storeBlogImage(image({ mimeType: "image/svg+xml", bytes: Buffer.from('<svg onload="alert(1)"/>') })), code("unsupported_image_type"));
  await assert.rejects(service.storeBlogImage(image({ mimeType: "application/x-executable", bytes: Buffer.from("MZ") })), code("unsupported_image_type"));
  await assert.rejects(service.storeBlogImage(image({ mimeType: "image/jpeg" })), code("image_type_mismatch"));
  await assert.rejects(service.storeBlogImage(image({ bytes: Buffer.from("<script>alert(1)</script>") })), code("image_type_mismatch"));
  await assert.rejects(service.storeBlogImage(image({ bytes: png.subarray(0, 40) })), code("invalid_image"));
});

test("media limits reject excessive bytes, excessive decoded pixels and invalid size configuration", async t => {
  const { repository, directory } = await store(t);
  const small = createMediaService(repository, join(directory, "small"), { maxBytes: png.length - 1, maxPixels: 24_000_000, maxDimension: 12000 });
  await assert.rejects(small.storeBlogImage(image()), code("image_too_large"));
  const pixels = createMediaService(repository, join(directory, "pixels"), { maxBytes: 10000, maxPixels: 100, maxDimension: 12000 });
  await assert.rejects(pixels.storeBlogImage(image()), code("invalid_image"));
  for (const value of ["0", "-1", "Infinity", "1.5", "999999999"]) assert.throws(() => blogUploadLimits({ BLOG_UPLOAD_MAX_BYTES: value }), code("media_not_configured"));
});

test("malicious original names never become storage paths and uploads cannot overwrite each other", async t => {
  const { service, directory } = await store(t);
  const first = await service.storeBlogImage(image({ originalName: "../../../../evil.php.png" }));
  const second = await service.storeBlogImage(image({ originalName: "C:\\temp\\evil.php.png" }));
  assert.equal(first.originalName, "evil.php.png"); assert.equal(second.originalName, "evil.php.png"); assert.notEqual(first.id, second.id);
  assert.deepEqual((await readdir(join(directory, "uploads"))).sort(), [first.fileName, second.fileName].sort());
});

test("media upload endpoint authenticates and checks CSRF/Origin before reading the body or storage", async t => {
  const { handlers, request, form } = await store(t);
  assert.equal((await handlers.upload(request("POST", form(), { Cookie: "" }))).status, 401);
  assert.equal((await handlers.upload(request("POST", form(), { "X-CSRF-Token": "wrong" }))).status, 403);
  assert.equal((await handlers.upload(request("POST", form(), { Origin: "https://attacker.test" }))).status, 403);
  assert.equal((await handlers.list(request("GET", undefined, { Cookie: "" }))).status, 401);
  let touched = false;
  const blocked = createMediaHandlers(() => { touched = true; throw new Error("must not open"); }, () => { throw new BlogError(401, "unauthorized", "No session"); });
  assert.equal((await blocked.upload(request("POST", "invalid"))).status, 401); assert.equal(touched, false);
});

test("multipart API stores metadata, lists/searches literal names and alt, and obtains media details", async t => {
  const { handlers, request, form } = await store(t);
  const response = await handlers.upload(request("POST", form(png, "image/png", "100%-workflow.png")));
  assert.equal(response.status, 201); const media = (await response.json()).data;
  assert.equal(media.alt, "Diagrama de operação"); assert.equal(media.type, "featured");
  for (const q of ["100%", "operação", media.fileName]) {
    const list = await handlers.list(request("GET", undefined, {}, `/api/admin/blog/media?q=${encodeURIComponent(q)}`));
    assert.equal(list.status, 200); assert.equal((await list.json()).data.total, 1);
  }
  assert.equal((await (await handlers.get(request(), media.id)).json()).data.usedBy.length, 0);
  const noMatch = await handlers.list(request("GET", undefined, {}, "/api/admin/blog/media?q=' OR 1=1--"));
  assert.equal((await noMatch.json()).data.total, 0);
  assert.throws(() => parseMediaQuery(new URLSearchParams("pageSize=9999")), code("invalid_request"));
});

test("media alt updates require a session and CSRF and persist without modifying saved post revisions", async t => {
  const { service, posts, handlers, request } = await store(t);
  const media = await service.storeBlogImage(image());
  const post = posts.createDraft({ title: "Image snapshot", featuredImage: { id: media.id, url: media.url, alt: "Context-specific alt", type: "featured" } });
  const body = JSON.stringify({ alt: "Updated library alt" });
  assert.equal((await handlers.update(request("PATCH", body, { "Content-Type": "application/json", Cookie: "" }), media.id)).status, 401);
  const response = await handlers.update(request("PATCH", body, { "Content-Type": "application/json" }), media.id);
  assert.equal(response.status, 200); assert.equal(service.get(media.id).alt, "Updated library alt"); assert.deepEqual(posts.get(post.id), post);
  assert.throws(() => service.updateAlt(media.id, "x".repeat(301)), code("invalid_request"));
});

test("media deletion blocks featured and internal references in drafts/published posts and handles stale editor saves", async t => {
  const { service, posts, database } = await store(t);
  const media = await service.storeBlogImage(image());
  const reference = { id: media.id, url: media.url, alt: media.alt, type: "featured" };
  const featured = posts.createDraft({ title: "Featured use", featuredImage: reference });
  await assert.rejects(service.remove(media.id, media.fileName), code("media_in_use"));
  posts.remove(featured.id, featured.revision);
  const internal = posts.createDraft({ title: "Internal use", blocks: [{ id: "image-1", type: "image", image: { ...reference, type: "internal" } }] });
  database.prepare("UPDATE blog_posts SET status='published', published_at=? WHERE id=?").run(new Date().toISOString(), internal.id);
  await assert.rejects(service.remove(media.id, media.fileName), code("media_in_use"));
  assert.equal(service.get(media.id).usedBy[0].id, internal.id);
  posts.remove(internal.id, 1);
  const stale = posts.createDraft({ title: "Editor opened before deletion" });
  await service.remove(media.id, media.fileName);
  assert.throws(() => posts.update(stale.id, { revision: 1, featuredImage: reference }), code("media_deleted"));
  assert.throws(() => posts.createDraft({ title: "Stale create", featuredImage: reference }), code("media_deleted"));
  assert.throws(() => service.get(media.id), code("media_not_found"));
});

test("unused media requires exact confirmation and deletes file plus visible metadata through the protected API", async t => {
  const { service, handlers, request, directory } = await store(t);
  const media = await service.storeBlogImage(image());
  await assert.rejects(service.remove(media.id, "wrong"), code("confirmation_required"));
  const response = await handlers.remove(request("DELETE", JSON.stringify({ confirmation: media.fileName }), { "Content-Type": "application/json" }), media.id);
  assert.equal(response.status, 200); assert.equal(service.list({ page: 1, pageSize: 12 }).total, 0);
  assert.equal((await blogImageResponse(media.fileName, join(directory, "uploads"))).status, 404);
});

test("public image response returns exact bytes with safe MIME/security headers and rejects traversal/symlink escapes", async t => {
  const { service, directory } = await store(t);
  const media = await service.storeBlogImage(image()); const uploads = join(directory, "uploads");
  const response = await blogImageResponse(media.fileName, uploads);
  assert.equal(response.status, 200); assert.equal(response.headers.get("content-type"), "image/png"); assert.equal(response.headers.get("x-content-type-options"), "nosniff"); assert.match(response.headers.get("content-security-policy")!, /sandbox/);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
  for (const name of ["../../.env.local", "%2e%2e%2f.env.local", "file.svg", "file.php", `${media.fileName}/extra`]) assert.equal((await blogImageResponse(name, uploads)).status, 404);
  const outside = join(directory, "outside.png"); await writeFile(outside, png);
  const linkName = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png"; await symlink(outside, join(uploads, linkName));
  assert.equal((await blogImageResponse(linkName, uploads)).status, 404);
});

test("multipart rejects oversized streamed requests, unexpected/duplicate fields and invalid image content", async t => {
  const { handlers, request, form } = await store(t);
  assert.equal((await handlers.upload(request("POST", form(), { "Content-Length": String(26 * 1024 * 1024) }))).status, 413);
  const duplicate = form(); duplicate.append("alt", "duplicate");
  assert.equal((await handlers.upload(request("POST", duplicate))).status, 400);
  const extra = form(); extra.set("directory", "../../public"); assert.equal((await handlers.upload(request("POST", extra))).status, 400);
  assert.equal((await handlers.upload(request("POST", form(Buffer.from("fake"))))).status, 415);
  assert.equal((await handlers.upload(request("POST", "{}", { "Content-Type": "application/json" }))).status, 415);
  const chunks = new ReadableStream({ start(controller) { for (let i = 0; i < 11; i++) controller.enqueue(new Uint8Array(1024 * 1024)); controller.close(); } });
  const streamed = new Request(`${config.origin}/api/admin/blog/media`, { method: "POST", headers: { ...Object.fromEntries(new Headers(request().headers)), "Content-Type": "multipart/form-data; boundary=test" }, body: chunks, duplex: "half" } as RequestInit);
  assert.equal((await handlers.upload(streamed)).status, 413);
});

test("future service clients reuse the same handlers with scoped bearer auth and no browser-only requirement", async t => {
  const { service, request, form } = await store(t);
  const environment = { BLOG_API_READ_TOKEN: "r".repeat(48), BLOG_API_WRITE_TOKEN: "w".repeat(48), BLOG_API_PUBLISH_TOKEN: "p".repeat(48) };
  const handlers = createMediaHandlers(() => service, (req, write) => { requireBlogScope(req, write ? "posts:write" : "posts:read", environment); });
  assert.equal((await handlers.upload(request("POST", form(), { Authorization: `Bearer ${environment.BLOG_API_READ_TOKEN}` }))).status, 403);
  assert.equal((await handlers.upload(request("POST", form(), { Authorization: `Bearer ${environment.BLOG_API_WRITE_TOKEN}`, Cookie: "", Origin: "" }))).status, 201);
  assert.equal((await handlers.list(request("GET", undefined, { Authorization: `Bearer ${environment.BLOG_API_READ_TOKEN}`, Cookie: "" }))).status, 200);
});

test("storage failure rolls back deletion metadata and metadata insertion failure cleans the new file", async t => {
  const { service, repository, database, directory } = await store(t);
  const media = await service.storeBlogImage(image());
  assert.throws(() => repository.remove(media.id, media.fileName, () => { throw new Error("simulated filesystem failure"); }));
  assert.equal(service.get(media.id).id, media.id);
  assert.deepEqual(await readFile(join(directory, "uploads", media.fileName)), png);
  database.exec("CREATE TRIGGER media_test_failure BEFORE INSERT ON blog_media BEGIN SELECT RAISE(ABORT, 'test-only insert failure'); END");
  await assert.rejects(service.storeBlogImage(image()));
  assert.deepEqual(await readdir(join(directory, "uploads")), [media.fileName]);
});

test("upload concurrency is bounded before body parsing and capacity is released after invalid requests", async t => {
  const { handlers, headers, request, form } = await store(t);
  const controllers: ReadableStreamDefaultController<Uint8Array>[] = [];
  function slow() {
    return new Request(`${config.origin}/api/admin/blog/media`, { method: "POST", headers: { ...headers, "Content-Type": "multipart/form-data; boundary=test" }, body: new ReadableStream<Uint8Array>({ start(controller) { controllers.push(controller); } }), duplex: "half" } as RequestInit);
  }
  const one = handlers.upload(slow()), two = handlers.upload(slow());
  const third = slow();
  assert.equal((await handlers.upload(third)).status, 429); assert.equal(third.bodyUsed, false);
  controllers.forEach(controller => controller.close());
  assert.deepEqual((await Promise.all([one, two])).map(response => response.status), [400, 400]);
  assert.equal((await handlers.upload(request("POST", form()))).status, 201);
});
