import assert from "node:assert/strict";
import { test } from "node:test";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createBlogService } from "../../lib/blog/service.ts";
import { createBlogHandlers } from "../../lib/blog/handlers.ts";
import { BlogError } from "../../lib/blog/errors.ts";
import { EDITORIAL_GUIDANCE } from "../../lib/blog/editorial-policy.ts";
import { blogJson } from "../../lib/blog/http.ts";
import { BLOG_TEMPLATE, LEGACY_BLOG_TEMPLATE } from "../../lib/blog/template.ts";
import { hasPlainTitleCharacters, TITLE_CHARACTER_INSTRUCTION, TITLE_CHARACTER_RULES } from "../../lib/blog/title-policy.ts";
import { completePostFixture } from "./fixtures.ts";

const forbidden = ["+", "|", "•", "→", "/", "\\", "🚀", "👨‍👩‍👧‍👦", "🇺🇸", "1\uFE0F\u20E3", "1\u20E3", "★", "™", "&", "%", "—", "…", "...", "!!!", "**", "𝑱𝒐𝒃𝒃𝒆𝒓", "Ｊｏｂｂｅｒ", "\u200b", "\u0336", "\u20dd", "\u034f", "((", '""'];

test("authoritative template and editorial guidance require rewriting titles before presenting or saving", async () => {
  const { data } = await blogJson({ data: BLOG_TEMPLATE }).json();
  assert.deepEqual(data.titleRules, TITLE_CHARACTER_RULES);
  assert.deepEqual(EDITORIAL_GUIDANCE.titleRules, TITLE_CHARACTER_RULES);
  assert.ok(EDITORIAL_GUIDANCE.text.includes(TITLE_CHARACTER_INSTRUCTION));
  assert.match(data.titleRules.instruction, /rewrite it before presenting it to the user or saving it/);
  assert.match(data.titleRules.instruction, /Wrong: Jobber \+ Quo Integration\. Correct: Jobber and Quo Integration/);
  assert.equal(Object.hasOwn(LEGACY_BLOG_TEMPLATE, "titleRules"), false);
});

test("all forbidden characters block both title fields before any draft is persisted", t => {
  const database = openBlogDatabase(":memory:"); t.after(() => database.close());
  const repository = createPostRepository(database), service = createBlogService(repository, async () => {});
  for (const symbol of forbidden) {
    const title = `Jobber ${symbol} Quo Integration`;
    assert.equal(hasPlainTitleCharacters(title), false, title);
    for (const field of TITLE_CHARACTER_RULES.fields) {
      assert.throws(() => service.createDraft({ title: "Plain title", [field]: title }), error => error instanceof BlogError && error.code === "title_characters" && error.details?.[0] === field);
    }
  }
  assert.equal(repository.list({ page: 1, pageSize: 20 }).total, 0);
});

test("invalid title updates preserve revision and content; the rewritten title saves", t => {
  const database = openBlogDatabase(":memory:"); t.after(() => database.close());
  const service = createBlogService(createPostRepository(database), async () => {});
  const post = service.createDraft({ title: "Original title" });
  for (const symbol of forbidden) {
    for (const field of TITLE_CHARACTER_RULES.fields) assert.throws(() => service.update(post.id, { revision: 1, [field]: `Jobber ${symbol} Quo` }), error => error instanceof BlogError && error.code === "title_characters");
    assert.deepEqual(service.get(post.id), post);
  }
  const updated = service.update(post.id, { revision: 1, title: "Jobber and Quo Integration", seoTitle: "Jobber and Quo Integration" });
  assert.equal(updated.revision, 2);
  assert.equal(updated.title, "Jobber and Quo Integration");
});

test("natural words remain valid and historical title reads and unrelated edits remain compatible", t => {
  const database = openBlogDatabase(":memory:"); t.after(() => database.close());
  const repository = createPostRepository(database), service = createBlogService(repository, async () => {});
  for (const [index, title] of ["Jobber and Quo Integration", "Jobber's integration guide", "What’s next for automation?", "Automation: 5 practical steps", "AI-powered customer operations", "Automação para pequenas empresas", "Ac\u0327a\u0303o e automac\u0327a\u0303o", "日本語の自動化ガイド"].entries()) {
    assert.equal(service.createDraft({ title, slug: `natural-title-${index}` }).title, title);
  }
  const legacy = repository.createDraft({ ...completePostFixture(false), title: "Jobber + Quo Integration", seoTitle: "Jobber | Quo" });
  assert.equal(service.get(legacy.id).title, legacy.title);
  const edited = service.update(legacy.id, { revision: 1, subtitle: "Jobber + Quo outside the title" });
  assert.equal(edited.title, legacy.title);
  assert.deepEqual(edited.blocks, legacy.blocks);
});

test("HTTP create and update reject invalid titles without persisting a mutation", async t => {
  const database = openBlogDatabase(":memory:"); t.after(() => database.close());
  const repository = createPostRepository(database), service = createBlogService(repository, async () => {});
  const handlers = createBlogHandlers(() => service, () => ({ kind: "service", scopes: ["posts:write"] }));
  const request = (method: string, body: unknown) => new Request("https://blog.example.test/api/internal/blog/posts", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const created = service.createDraft({ title: "Plain title" });
  for (const response of [
    await handlers.create(request("POST", { title: "Jobber + Quo Integration" })),
    await handlers.create(request("POST", { title: "Plain title", seoTitle: "Jobber | Quo" })),
    await handlers.update(request("PATCH", { revision: 1, title: "Jobber 🚀 Quo" }), created.id),
  ]) {
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, "title_characters");
  }
  assert.equal(repository.list({ page: 1, pageSize: 20 }).total, 1);
  assert.deepEqual(service.get(created.id), created);
});
