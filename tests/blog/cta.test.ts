import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createBlogService } from "../../lib/blog/service.ts";
import { createBlogHandlers } from "../../lib/blog/handlers.ts";
import { BlogError } from "../../lib/blog/errors.ts";
import { CTA_BUTTON_RULES, countCtaCharacters } from "../../lib/blog/cta-policy.ts";
import { BLOG_TEMPLATE, LEGACY_BLOG_TEMPLATE } from "../../lib/blog/template.ts";
import { parseBlocks } from "../../lib/blog/validation.ts";
import { completePostFixture } from "./fixtures.ts";

const labelOfLength = (length: number) => `${"a".repeat(length - 2)} →`;
function store(t: TestContext) {
  const database = openBlogDatabase(":memory:"); t.after(() => database.close());
  const repository = createPostRepository(database);
  const service = createBlogService(repository, async () => {});
  const handlers = createBlogHandlers(() => service, () => ({ kind: "service", scopes: ["posts:read", "posts:publish"] }), () => "https://automasoluct.com");
  return { repository, service, handlers };
}
function fieldsWithLabel(label: string) {
  const fields = completePostFixture(false);
  const cta = fields.blocks.find(b => b.type === "cta")!;
  cta.label = label;
  return fields;
}
test("backend template v4 exposes permanent CTA length, exact suffix, uniqueness and context", () => {
  assert.equal(BLOG_TEMPLATE.version, 4);
  assert.deepEqual(BLOG_TEMPLATE.ctaButtonRules, CTA_BUTTON_RULES);
  assert.equal(BLOG_TEMPLATE.ctaButtonRules.minCharacters, 45);
  assert.equal(BLOG_TEMPLATE.ctaButtonRules.maxCharacters, 50);
  assert.equal(BLOG_TEMPLATE.ctaButtonRules.suffix, " →");
  assert.equal(BLOG_TEMPLATE.ctaButtonRules.context, "immediately_previous_section");
  assert.equal(BLOG_TEMPLATE.ctaButtonRules.severity, "error");
  assert.equal(LEGACY_BLOG_TEMPLATE.version, 1);
  assert.equal("ctaButtonRules" in LEGACY_BLOG_TEMPLATE, false);
});
for (const length of [44, 45, 48, 50, 51]) test(`saved CTA length ${length} includes the final space and arrow`, async t => {
  const { service } = store(t);
  const post = service.createDraft(fieldsWithLabel(labelOfLength(length)));
  const result = await service.validate(post.id);
  const invalid = length < 45 || length > 50;
  assert.equal(result.valid, !invalid);
  assert.equal(result.errors.some(e => e.code === "cta_label_length" && e.field === "blocks.1.label"), invalid);
  assert.ok(!result.warnings.some(w => w.code === "cta_label_length"));
  if (invalid) await assert.rejects(service.publish(post.id, { revision: 1 }), e => e instanceof BlogError && e.status === 422);
  assert.deepEqual(service.get(post.id), post);
});
for (const label of ["a".repeat(48), `${"a".repeat(46)}→`, `${"a".repeat(46)} ➡`, `${labelOfLength(48)} `, `${labelOfLength(48)}\n`, `${labelOfLength(48)}.`, `${"a".repeat(46)}\u00a0→`]) {
  test(`saved CTA requires exact final space and arrow: ${JSON.stringify(label.slice(-4))}`, async t => {
    const { service, handlers } = store(t);
    const post = service.createDraft(fieldsWithLabel(label));
    assert.equal(post.blocks.find(b => b.type === "cta")?.label, label);
    const result = await service.validate(post.id);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.code === "cta_label_suffix"));
    assert.ok(!result.warnings.some(w => w.code === "cta_label_suffix"));
    const preview = await handlers.preview(new Request("https://automasoluct.com/api/internal/blog/posts/id/preview"), post.id);
    assert.equal(preview.status, 422);
    await assert.rejects(service.publish(post.id, { revision: 1 }), e => e instanceof BlogError && e.status === 422);
    assert.deepEqual(service.get(post.id), post);
  });
}
test("visible Unicode accents and emoji count once in saved labels", async t => {
  const { service } = store(t);
  assert.equal(countCtaCharacters("Automate missed calls and book more jobs today →"), 48);
  for (const label of [`${"e\u0301".repeat(48)} →`, `${"😀".repeat(48)} →`, `${"👩‍💻".repeat(43)} →`]) {
    assert.ok([45, 50].includes(countCtaCharacters(label)));
    const post = service.createDraft(fieldsWithLabel(label));
    assert.equal((await service.validate(post.id)).valid, true);
    assert.equal(post.blocks.find(b => b.type === "cta")?.label, label);
  }
});
test("write parser does not trim away a trailing space or newline before validation", () => {
  for (const label of [`${labelOfLength(48)} `, `${labelOfLength(48)}\n`, "Legacy CTA", labelOfLength(51)]) {
    const parsed = parseBlocks([{ id: "cta", type: "cta", label, text: "", href: "/contact" }])[0];
    assert.ok(parsed.type === "cta"); assert.equal(parsed.label, label);
  }
});
for (const normalized of [false, true]) test(`duplicate CTA is an error (${normalized ? "normalized" : "exact"})`, async t => {
  const { service, handlers } = store(t), fields = completePostFixture(false);
  const buttons = fields.blocks.filter(b => b.type === "cta");
  buttons[1].label = normalized ? buttons[0].label.toLowerCase() : buttons[0].label;
  const post = service.createDraft(fields), result = await service.validate(post.id);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.code === "repeated_cta"));
  assert.ok(!result.warnings.some(w => w.code === "repeated_cta"));
  const request = new Request("https://automasoluct.com/api/internal/blog/posts/id/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: 1 }) });
  assert.equal((await handlers.publish(request, post.id)).status, 422);
  assert.deepEqual(service.get(post.id), post);
});
test("unmarked legacy posts keep their labels, warnings, prior template and publication readiness", async t => {
  const { repository, service } = store(t), fields = completePostFixture(true);
  delete fields.editorial;
  const buttons = fields.blocks.filter(b => b.type === "cta");
  buttons[0].label = "Legacy CTA"; buttons[1].label = "Legacy CTA";
  const post = repository.createDraft(fields), result = await service.validate(post.id);
  assert.equal(result.valid, true); assert.deepEqual(result.errors, []);
  for (const code of ["cta_label_length", "cta_label_suffix", "repeated_cta"]) assert.ok(result.warnings.some(w => w.code === code));
  assert.deepEqual(service.get(post.id), post);
});
