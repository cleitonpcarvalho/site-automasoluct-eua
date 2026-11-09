import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";

import sitemap from "../../app/sitemap.ts";
import { getBlogDatabase } from "../../lib/blog/database.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createBlogService } from "../../lib/blog/service.ts";
import { completePostFixture } from "./fixtures.ts";

async function store(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "automa-sitemap-"));
  const previous = process.env.BLOG_DATA_DIR;
  process.env.BLOG_DATA_DIR = directory;
  const database = getBlogDatabase();
  t.after(async () => {
    database.close();
    if (previous === undefined) delete process.env.BLOG_DATA_DIR;
    else process.env.BLOG_DATA_DIR = previous;
    await rm(directory, { recursive: true, force: true });
  });
  const repository = createPostRepository(database);
  const service = createBlogService(repository, async () => {});
  return { database, repository, service };
}

test("sitemap preserves all six static URLs and their existing frequencies with no published posts", async t => {
  await store(t);
  const entries = sitemap();
  assert.deepEqual(entries.map(entry => [entry.url, entry.changeFrequency]), [
    ["https://automasoluct.com/", "weekly"],
    ["https://automasoluct.com/jobber-automation", "monthly"],
    ["https://automasoluct.com/integrations", "monthly"],
    ["https://automasoluct.com/contact", "monthly"],
    ["https://automasoluct.com/privacy", "yearly"],
    ["https://automasoluct.com/terms", "yearly"],
  ]);
  assert.ok(entries.every(entry => entry.lastModified instanceof Date));
});

test("sitemap includes multiple published canonical article URLs and excludes drafts and previews", async t => {
  const { service } = await store(t);
  const first = service.createDraft(completePostFixture(false));
  const second = service.createDraft(completePostFixture(false));
  const draft = service.createDraft(completePostFixture(false));
  await service.publish(first.id, { revision: first.revision });
  await service.publish(second.id, { revision: second.revision });
  const entries = sitemap();
  assert.equal(entries.length, 8);
  const articles = entries.filter(entry => entry.url.includes("/blog/"));
  assert.deepEqual(articles.map(entry => entry.url).sort(), [first, second].map(post => `https://automasoluct.com/blog/${post.slug}`).sort());
  assert.ok(articles.every(entry => entry.changeFrequency === "monthly" && entry.priority === 0.6));
  assert.ok(entries.every(entry => !entry.url.includes(draft.slug) && !entry.url.includes("/admin") && !entry.url.includes("/preview") && !entry.url.includes("?")));
});

test("sitemap lastmod uses updatedAt and falls back to publishedAt when updatedAt is unavailable", async t => {
  const { database, service } = await store(t);
  const draft = service.createDraft(completePostFixture(false));
  const published = await service.publish(draft.id, { revision: draft.revision });
  const updatedAt = "2026-10-03T15:30:00.000Z";
  const publishedAt = "2026-09-01T10:00:00.000Z";
  database.prepare("UPDATE blog_posts SET updated_at = ?, published_at = ? WHERE id = ?").run(updatedAt, publishedAt, published.id);
  const url = `https://automasoluct.com/blog/${published.slug}`;
  assert.equal(sitemap().find(entry => entry.url === url)?.lastModified, updatedAt);
  database.prepare("UPDATE blog_posts SET updated_at = '' WHERE id = ?").run(published.id);
  assert.equal(sitemap().find(entry => entry.url === url)?.lastModified, publishedAt);
});

test("fresh sitemap reads automatically reflect publication, withdrawal, republication and deletion", async t => {
  const { service } = await store(t);
  const draft = service.createDraft(completePostFixture(false));
  const url = `https://automasoluct.com/blog/${draft.slug}`;
  const included = () => sitemap().some(entry => entry.url === url);
  assert.equal(included(), false);
  const published = await service.publish(draft.id, { revision: draft.revision });
  assert.equal(included(), true);
  const withdrawn = service.update(published.id, { revision: published.revision, status: "draft" });
  assert.equal(included(), false);
  const republished = await service.publish(withdrawn.id, { revision: withdrawn.revision });
  assert.equal(included(), true);
  service.remove(republished.id, republished.revision);
  assert.equal(included(), false);
  assert.equal(sitemap().length, 6);
});

test("sitemap includes every published article beyond the first page of results", async t => {
  const { repository } = await store(t);
  const expected = Array.from({ length: 103 }, () => {
    const draft = repository.createDraft(completePostFixture(false));
    const published = repository.publish(draft.id, draft.revision);
    return `https://automasoluct.com/blog/${published.slug}`;
  });
  repository.createDraft(completePostFixture(false));
  const entries = sitemap();
  assert.equal(entries.length, 109);
  assert.deepEqual(entries.filter(entry => entry.url.includes("/blog/")).map(entry => entry.url).sort(), expected.sort());
});

test("sitemap generation works with read-only storage and preserves saved article data", async t => {
  const { database, service } = await store(t);
  const draft = service.createDraft(completePostFixture(false));
  await service.publish(draft.id, { revision: draft.revision });
  const before = database.prepare("SELECT * FROM blog_posts ORDER BY id").all();
  database.exec("PRAGMA query_only = ON");
  assert.equal(sitemap().length, 7);
  assert.deepEqual(database.prepare("SELECT * FROM blog_posts ORDER BY id").all(), before);
});
