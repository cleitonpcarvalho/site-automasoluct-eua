import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";

import { requireBlogScope } from "../../lib/blog/auth.ts";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { BlogError } from "../../lib/blog/errors.ts";
import { createBlogHandlers } from "../../lib/blog/handlers.ts";
import { validatePublication } from "../../lib/blog/publication.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createBlogService } from "../../lib/blog/service.ts";
import { BLOG_TEMPLATE } from "../../lib/blog/template.ts";
import { completePostFixture } from "./fixtures.ts";

function store(t: TestContext) {
  const database = openBlogDatabase(":memory:");
  t.after(() => database.close());
  const repository = createPostRepository(database);
  const service = createBlogService(repository, async () => {});
  return { repository, service };
}

test("the approved template preserves the exact 26-slot order and H3 requirements", () => {
  assert.deepEqual(BLOG_TEMPLATE.slots.map(slot => slot.type), [
    "text", "cta", "heading", "text", "image", "heading", "text", "cta", "image", "text", "cta", "heading", "text",
    "image", "heading", "text", "cta", "image", "text", "heading", "text", "video", "text", "heading", "text", "form",
  ]);
  assert.equal(BLOG_TEMPLATE.slots.filter(slot => slot.type === "text").length, 10);
  assert.equal(BLOG_TEMPLATE.slots.filter(slot => slot.type === "heading" && slot.level === 3).length, 6);
  assert.equal(BLOG_TEMPLATE.slots.some(slot => slot.optional), false);
});

test("publication requires a complete exact template, a video and nonempty metadata", async t => {
  const { service } = store(t);
  const draft = service.createDraft(completePostFixture());
  assert.doesNotThrow(() => validatePublication(draft));
  const variations = [
    { ...draft, video: null },
    { ...draft, excerpt: "" },
    { ...draft, featuredImage: null },
    { ...draft, blocks: [...draft.blocks].reverse() },
    { ...draft, blocks: draft.blocks.slice(0, -1) },
    { ...draft, blocks: draft.blocks.map(block => block.type === "heading" ? { ...block, level: 2 as const } : block) },
    { ...draft, blocks: draft.blocks.map(block => block.type === "text" ? { ...block, content: "" } : block) },
    { ...draft, blocks: draft.blocks.filter(block => block.type !== "image") },
  ];
  for (const variant of variations) assert.throws(() => validatePublication(variant), error => error instanceof BlogError && error.status === 422);
  const incomplete = service.createDraft({ title: "Incomplete" });
  await assert.rejects(() => service.publish(incomplete.id, { revision: 1 }), error => error instanceof BlogError && error.status === 422);
  assert.equal(service.get(incomplete.id).status, "draft");
});

test("only explicit publication makes a validated draft public and advances its revision", async t => {
  const { service } = store(t);
  const draft = service.createDraft(completePostFixture());
  assert.equal(service.getPublished(draft.slug), null);
  const published = await service.publish(draft.id, { revision: 1 });
  assert.equal(published.status, "published");
  assert.equal(published.revision, 2);
  assert.ok(published.publishedAt);
  assert.deepEqual(service.getPublished(draft.slug), published);
  await assert.rejects(() => service.publish(draft.id, { revision: 1 }), error => error instanceof BlogError && error.status === 409);
});

test("missing media prevents publication without mutating the draft", async t => {
  const { repository } = store(t);
  const service = createBlogService(repository, async () => { throw new BlogError(404, "image_not_found", "Not found."); });
  const draft = service.createDraft(completePostFixture());
  await assert.rejects(() => service.publish(draft.id, { revision: 1 }), error => error instanceof BlogError && error.code === "missing_image");
  assert.equal(service.get(draft.id).revision, 1);
  assert.equal(service.get(draft.id).status, "draft");
});

test("an edit during image validation cannot be published as the earlier reviewed revision", async t => {
  const { repository } = store(t);
  let edited = false;
  let id = "";
  const service = createBlogService(repository, async () => {
    if (edited) return;
    edited = true;
    repository.update(id, { revision: 1, changes: { title: "A concurrent unapproved edit" } });
  });
  const draft = service.createDraft(completePostFixture());
  id = draft.id;
  await assert.rejects(() => service.publish(id, { revision: 1 }), error => error instanceof BlogError && error.code === "revision_conflict");
  assert.equal(service.get(id).status, "draft");
  assert.equal(service.get(id).revision, 2);
});

test("the HTTP publish endpoint uses its own credential and enforces the editorial contract", async t => {
  const { service } = store(t);
  const environment = { BLOG_API_PUBLISH_TOKEN: "publication-test-only-".padEnd(48, "p") };
  const handlers = createBlogHandlers(() => service, (request, scope) => requireBlogScope(request, scope, environment));
  const draft = service.createDraft(completePostFixture());
  const response = await handlers.publish(new Request("http://localhost/api/internal/blog/posts/id/publish", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${environment.BLOG_API_PUBLISH_TOKEN}` }, body: JSON.stringify({ revision: 1 }),
  }), draft.id);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.status, "published");
});
