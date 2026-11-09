import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { createMediaRepository } from "../../lib/blog/media-repository.ts";
import { createMediaService } from "../../lib/blog/media-service.ts";
import { createStoredImageVerifier } from "../../lib/blog/media-verification.ts";
import { createBlogService } from "../../lib/blog/service.ts";
import { createBlogHandlers } from "../../lib/blog/handlers.ts";
import { readBlogImage } from "../../lib/blog/media.ts";
import { BlogError } from "../../lib/blog/errors.ts";
import { imageSessionGuidance } from "../../lib/blog/image-workflow.ts";
import { BLOG_TEMPLATE } from "../../lib/blog/template.ts";
import type { BlogImage, BlogPostFields } from "../../lib/blog/types.ts";
import { completePostFixture } from "./fixtures.ts";

async function store(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "blog-real-image-workflow-")), uploads = join(directory, "uploads"), filename = join(directory, "blog.sqlite");
  t.after(() => rm(directory, { recursive: true, force: true }));
  const database = openBlogDatabase(filename); t.after(() => database.close());
  const repository = createPostRepository(database), media = createMediaRepository(database), storage = createMediaService(media, uploads);
  const verify = createStoredImageVerifier(id => media.get(id), filename => readBlogImage(filename, uploads));
  const service = createBlogService(repository, verify);
  const handlers = createBlogHandlers(() => service, () => ({ kind: "service", scopes: ["posts:read", "posts:publish"] }), () => "https://automasoluct.com");
  const fields = completePostFixture(false);
  const records: Awaited<ReturnType<typeof storage.storeBlogImage>>[] = [];
  // Real decodable fixture bytes, used only in temporary test storage. There is
  // no production generator and no network/API call in this test or service.
  for (let i = 0; i < 5; i++) {
    const bytes = await sharp({ create: { width: 32, height: 18, channels: 3, background: { r: 10 + i * 30, g: 40, b: 90 } } }).png().toBuffer();
    records.push(await storage.storeBlogImage({ bytes, mimeType: "image/png", type: i === 0 ? "featured" : "internal", alt: `Real workflow fixture ${i + 1}`, provenance: { sourceAssets: i === 0 ? ["default_cover_portrait", "default_cover_logo"] : [], source: "generated" } }));
  }
  const reference = (index: number): BlogImage => ({ id: records[index].id, url: records[index].url, alt: records[index].alt, type: index === 0 ? "featured" : "internal", provenance: records[index].provenance });
  fields.featuredImage = reference(0);
  let index = 1;
  fields.blocks = fields.blocks.map(block => block.type === "image" ? { ...block, image: reference(index++) } : block);
  return { database, repository, service, handlers, storage, fields, records, uploads, filename };
}
const body = (fields: BlogPostFields) => fields.blocks.find(b => b.type === "image")!;

test("five real uploaded files persist, associate exactly and verify 5/5 without publishing", async t => {
  const { service, fields, records, filename } = await store(t);
  const post = service.createDraft(fields);
  const reread = service.get(post.id);
  assert.deepEqual(reread.featuredImage, fields.featuredImage);
  assert.deepEqual(reread.blocks.filter(b => b.type === "image").map(b => b.image?.id), records.slice(1).map(r => r.id));
  const validation = await service.validate(post.id);
  assert.equal(validation.valid, true); assert.equal(validation.imageStatus?.associated, 5);
  assert.equal(validation.imageStatus?.verified, 5); assert.equal(validation.imageStatus?.complete, true);
  const reopened = openBlogDatabase(filename); t.after(() => reopened.close());
  assert.deepEqual(createPostRepository(reopened).get(post.id), reread);
  assert.equal(createMediaRepository(reopened).get(records[4].id).url, records[4].url);
  assert.equal(service.get(post.id).status, "draft"); assert.equal(service.get(post.id).revision, 1);
});
for (const missing of ["featured", "all_body", "one_body"] as const) test(`preview blocks missing ${missing} images`, async t => {
  const { service, handlers, fields } = await store(t);
  if (missing === "featured") fields.featuredImage = null;
  else fields.blocks = fields.blocks.map(b => b.type === "image" && (missing === "all_body" || b.id === "image-1") ? { ...b, image: null } : b);
  const post = service.createDraft(fields), result = await service.validate(post.id);
  assert.equal(result.valid, false); assert.equal(result.imageStatus?.complete, false);
  assert.ok(result.imageStatus!.associated < 5);
  assert.equal((await handlers.preview(new Request(`https://automasoluct.com/api/internal/blog/posts/${post.id}/preview`), post.id)).status, 422);
  await assert.rejects(service.publish(post.id, { revision: 1 }), e => e instanceof BlogError && e.status === 422);
  assert.deepEqual(service.get(post.id), post);
});
for (const orphanFile of [false, true]) test(`an unregistered reference is rejected even if a file ${orphanFile ? "exists" : "does not exist"}`, async t => {
  const { service, fields, records, uploads } = await store(t), id = randomUUID();
  body(fields).image = { ...body(fields).image!, id, url: `/uploads/blog/${id}.png` };
  if (orphanFile) await writeFile(join(uploads, `${id}.png`), await readFile(join(uploads, records[1].fileName)));
  const post = service.createDraft(fields), result = await service.validate(post.id);
  assert.equal(result.valid, false); assert.equal(result.imageStatus?.verified, 4);
  assert.ok(result.errors.some(e => e.code === "media_upload_unconfirmed"));
  assert.equal(result.imageStatus?.complete, false);
});
test("a media record without its stored file is not a confirmed complete image", async t => {
  const { service, fields, records, uploads } = await store(t);
  await unlink(join(uploads, records[1].fileName));
  const result = await service.validate(service.createDraft(fields).id);
  assert.ok(result.errors.some(e => e.code === "missing_image")); assert.equal(result.imageStatus?.complete, false);
});
test("placeholder labels cannot hide behind real files and media records", async t => {
  const { service, fields } = await store(t);
  body(fields).image!.alt = "Placeholder image";
  const result = await service.validate(service.createDraft(fields).id);
  assert.ok(result.errors.some(e => e.code === "image_placeholder")); assert.equal(result.imageStatus?.complete, false);
});
test("one-pixel stand-ins are rejected for policy posts", async t => {
  const { service, storage, fields } = await store(t);
  const bytes = await sharp({ create: { width: 1, height: 1, channels: 3, background: "white" } }).png().toBuffer();
  const pixel = await storage.storeBlogImage({ bytes, mimeType: "image/png", alt: "Workflow diagram", type: "internal" });
  body(fields).image = { id: pixel.id, url: pixel.url, alt: pixel.alt, type: "internal" };
  const result = await service.validate(service.createDraft(fields).id);
  assert.ok(result.errors.some(e => e.code === "image_placeholder")); assert.equal(result.imageStatus?.complete, false);
});
test("a mismatched upload reference or truncated stored file cannot pass verification", async t => {
  const { service, fields, records, uploads } = await store(t);
  const changed = { ...structuredClone(fields), slug: `${fields.slug}-mismatch` }; body(changed).image!.url = records[1].url.replace(/png$/, "jpg");
  const mismatch = await service.validate(service.createDraft(changed).id);
  assert.ok(mismatch.errors.some(e => e.code === "media_reference_mismatch"));
  const file = join(uploads, records[1].fileName), bytes = await readFile(file);
  await writeFile(file, bytes.subarray(0, -1));
  const truncated = await service.validate(service.createDraft(fields).id);
  assert.ok(truncated.errors.some(e => e.code === "media_content_mismatch"));
  assert.equal(truncated.imageStatus?.complete, false);
});
test("official source logo bytes are not a finished featured cover", async t => {
  const { service, storage, fields } = await store(t);
  const bytes = await readFile(new URL("../../public/assets/automasoluct/logo-automasoluct.png", import.meta.url));
  const source = await storage.storeBlogImage({ bytes, mimeType: "image/png", type: "featured", alt: "Cover composition", provenance: { sourceAssets: ["default_cover_portrait", "default_cover_logo"] } });
  fields.featuredImage = { id: source.id, url: source.url, alt: source.alt, type: "featured", provenance: source.provenance };
  const result = await service.validate(service.createDraft(fields).id);
  assert.ok(result.errors.some(e => e.code === "cover_source_asset")); assert.equal(result.imageStatus?.complete, false);
});
test("unavailable native generation returns a stop instruction, never a backend generator", () => {
  assert.equal(BLOG_TEMPLATE.imageWorkflowVersion, 1);
  const guidance = imageSessionGuidance({ imageGenerationAvailable: false });
  assert.equal(guidance.action, "stop"); assert.equal(guidance.mcpGeneratesImages, false);
  assert.match(guidance.message, /INCOMPLETE_DRAFT/);
});
test("legacy filesystem-only references keep their compatibility", async t => {
  const { repository, service, fields, database } = await store(t);
  // Legacy v1 requires a video and keeps all 26 slots. Only its upload registry
  // requirement is deliberately relaxed, as before this workflow change.
  const legacy = completePostFixture(true); delete legacy.editorial;
  legacy.featuredImage = fields.featuredImage;
  let index = 0; const images = fields.blocks.filter(b => b.type === "image");
  legacy.blocks = legacy.blocks.map(b => b.type === "image" ? { ...b, image: images[index++].image } : b);
  const post = repository.createDraft(legacy);
  database.prepare("DELETE FROM blog_media").run();
  const result = await service.validate(post.id);
  assert.equal(result.valid, true); assert.equal(result.imageStatus?.verified, 5);
  assert.deepEqual(service.get(post.id), post);
});
