import assert from "node:assert/strict";
import { test } from "node:test";

import { emptyAdminBlocks } from "../../lib/blog/admin/editor.ts";
import { assessmentBridgeParagraphs, BLOG_ASSESSMENT_HREF, BLOG_ASSESSMENT_ID, BLOG_CONVERSION_RULES } from "../../lib/blog/conversion.ts";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { EDITORIAL_GUIDANCE } from "../../lib/blog/editorial-policy.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createBlogService } from "../../lib/blog/service.ts";
import { BLOG_TEMPLATE } from "../../lib/blog/template.ts";
import { parseBlocks } from "../../lib/blog/validation.ts";
import { completePostFixture } from "./fixtures.ts";

test("template and admin defaults expose a short closing bridge and same-article assessment anchor", () => {
  assert.deepEqual(BLOG_TEMPLATE.conversionRules, BLOG_CONVERSION_RULES);
  assert.deepEqual(EDITORIAL_GUIDANCE.conversion, BLOG_CONVERSION_RULES);
  assert.equal(BLOG_CONVERSION_RULES.maxParagraphs, 2);
  assert.equal(BLOG_CONVERSION_RULES.maxCharactersPerParagraph, 280);
  assert.equal(BLOG_ASSESSMENT_HREF, `#${BLOG_ASSESSMENT_ID}`);
  assert.ok(emptyAdminBlocks().filter(block => block.type === "cta").every(block => block.href === BLOG_ASSESSMENT_HREF));
  assert.match(BLOG_TEMPLATE.slots.find(slot => slot.id === "closing-text")!.purpose, /280/);
});

test("short authored closing paragraphs and contextual links are preserved", () => {
  const paragraphs = ["Share the workflow you want to improve.", "Submit the assessment below for a practical next step."];
  assert.deepEqual(assessmentBridgeParagraphs(paragraphs.join("\n\n")), paragraphs);
  const linked = `[Review your workflow](https://example.com/${"a".repeat(300)}) with an engineer.`;
  assert.deepEqual(assessmentBridgeParagraphs(linked), [linked]);
  assert.notDeepEqual(assessmentBridgeParagraphs(linked, false), [linked]);
  assert.deepEqual(assessmentBridgeParagraphs("e\u0301".repeat(280)), ["e\u0301".repeat(280)]);
});

for (const content of ["a".repeat(281), "First.\n\nSecond.\n\nThird.", "", "\n \n"]) {
  test(`long or unfinished closing uses a complete conversion bridge (${JSON.stringify(content.slice(0, 20))})`, () => {
    const paragraphs = assessmentBridgeParagraphs(content);
    assert.equal(paragraphs.length, 2);
    assert.ok(paragraphs.every(paragraph => paragraph.length <= 280));
    assert.match(paragraphs.join(" "), /Submit the assessment below/);
    assert.ok(paragraphs.every(paragraph => /[.!?]$/.test(paragraph)));
  });
}

test("CTA parser accepts the assessment fragment while preserving existing safe URLs", () => {
  for (const href of [BLOG_ASSESSMENT_HREF, "/contact", "https://example.com/assessment"]) {
    const block = parseBlocks([{ id: "cta-1", type: "cta", text: "", label: "Review your workflow", href }])[0];
    assert.ok(block.type === "cta");
    assert.equal(block.href, href);
    assert.equal(block.text, "");
  }
  for (const href of ["#other", "javascript:alert(1)", "//evil.example", "#free-assessment\nmalicious"]) {
    assert.throws(() => parseBlocks([{ id: "cta-1", type: "cta", text: "", label: "Review your workflow", href }]));
  }
});

test("recent posts return the latest eight published articles, exclude the current post and never mutate storage", t => {
  const database = openBlogDatabase(":memory:"); t.after(() => database.close());
  const repository = createPostRepository(database);
  const service = createBlogService(repository, async () => {});
  const published = Array.from({ length: 12 }, (_, index) => {
    const post = repository.createDraft(completePostFixture(false));
    const result = repository.publish(post.id, post.revision);
    database.prepare("UPDATE blog_posts SET published_at = ? WHERE id = ?").run(`2026-01-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`, post.id);
    return result;
  });
  const draft = repository.createDraft(completePostFixture(false));
  const before = database.prepare("SELECT * FROM blog_posts ORDER BY id").all();
  database.exec("PRAGMA query_only = ON");
  const newestFirst = [...published].reverse();
  for (const current of [published[11], published[0], draft]) {
    const recent = service.listRecentPublished(current.id);
    assert.deepEqual(recent.map(post => post.id), newestFirst.filter(post => post.id !== current.id).slice(0, 8).map(post => post.id));
    assert.ok(recent.every(post => post.status === "published" && post.id !== draft.id));
  }
  assert.deepEqual(database.prepare("SELECT * FROM blog_posts ORDER BY id").all(), before);
});

test("recent posts support empty and small collections", t => {
  const database = openBlogDatabase(":memory:"); t.after(() => database.close());
  const repository = createPostRepository(database);
  const service = createBlogService(repository, async () => {});
  assert.deepEqual(service.listRecentPublished("current"), []);
  const first = repository.createDraft(completePostFixture(false));
  repository.publish(first.id, first.revision);
  const second = repository.createDraft(completePostFixture(false));
  repository.publish(second.id, second.revision);
  assert.deepEqual(service.listRecentPublished(first.id).map(post => post.id), [second.id]);
});
