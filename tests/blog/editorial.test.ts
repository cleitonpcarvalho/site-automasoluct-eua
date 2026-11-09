import assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { BLOG_MIGRATIONS } from "../../lib/blog/migrations.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createBlogService } from "../../lib/blog/service.ts";
import { parseEditorFields, toEditorFields } from "../../lib/blog/admin/editor.ts";
import { completePostFixture } from "./fixtures.ts";

test("v4 migration preserves a published v3 row, status, revision and content without opting it into new rules", async t => {
  const directory = await mkdtemp(join(tmpdir(), "blog-editorial-upgrade-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filename = join(directory, "blog.sqlite"), old = new DatabaseSync(filename);
  old.exec("CREATE TABLE blog_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL) STRICT");
  for (const migration of BLOG_MIGRATIONS.slice(0, 3)) { old.exec(migration.sql); old.prepare("INSERT INTO blog_migrations VALUES (?,?)").run(migration.version, new Date().toISOString()); }
  old.prepare("INSERT INTO blog_posts (id,title,slug,status,revision,created_at,updated_at,published_at) VALUES (?,?,?,?,?,?,?,?)").run("11111111-1111-4111-8111-111111111111", "Legacy — title", "legacy-title", "published", 7, "2026-01-01", "2026-01-02", "2026-01-02");
  const before = old.prepare("SELECT * FROM blog_posts").get(); old.close();
  const next = openBlogDatabase(filename); t.after(() => next.close());
  const { editorial, ...after } = next.prepare("SELECT * FROM blog_posts").get()!;
  assert.equal(editorial, null); assert.deepEqual(after, { ...before });
  assert.equal(createPostRepository(next).getPublishedBySlug("legacy-title")?.revision, 7);
});
test("new posts allow empty CTA explanations, omit video and keep policy/provenance through the admin editor", t => {
  const database = openBlogDatabase(":memory:"); t.after(() => database.close());
  const service = createBlogService(createPostRepository(database), async () => {});
  const fields = completePostFixture(false);
  fields.blocks = fields.blocks.map(b => b.type === "cta" ? { ...b, text: "" } : b);
  const post = service.createDraft(fields);
  const edited = parseEditorFields(toEditorFields(post));
  assert.deepEqual(edited.editorial, post.editorial);
  assert.deepEqual(edited.featuredImage?.provenance, post.featuredImage?.provenance);
  assert.equal(edited.blocks.some(b => b.type === "video"), false);
  assert.equal(edited.blocks.length, 25);
});
test("legacy editorial issues remain warnings and admin edits do not silently opt old posts into new rules", async t => {
  const database = openBlogDatabase(":memory:"); t.after(() => database.close());
  const repository = createPostRepository(database), service = createBlogService(repository, async () => {});
  const fields = completePostFixture(); delete fields.editorial;
  fields.title = "Old — article";
  const post = repository.createDraft(fields);
  assert.equal(parseEditorFields(toEditorFields(post)).editorial, undefined);
  const result = await service.validate(post.id);
  assert.equal(result.valid, true); assert.ok(result.warnings.some(w => w.code === "em_dash"));
  assert.deepEqual(service.get(post.id), post);
});
test("body brand provenance stored with media cannot be hidden in a post reference", async t => {
  const database = openBlogDatabase(":memory:"); t.after(() => database.close());
  const repository = createPostRepository(database);
  const service = createBlogService(repository, async image => image.type === "internal" ? { sourceAssets: ["default_cover_logo"] } : undefined);
  const post = service.createDraft(completePostFixture(false));
  assert.ok((await service.validate(post.id)).errors.some(e => e.code === "brand_asset_in_body"));
  assert.equal(service.get(post.id).blocks.find(b => b.type === "image")?.image?.provenance, undefined);
});
