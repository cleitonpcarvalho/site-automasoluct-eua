import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { officialCoverAssetIds } from "../../lib/blog/cover-asset-metadata.ts";
import { BLOG_TEMPLATE, LEGACY_BLOG_TEMPLATE } from "../../lib/blog/template.ts";
import { blogJson } from "../../lib/blog/http.ts";
import { BlogError } from "../../lib/blog/errors.ts";
import { createStoredImageVerifier } from "../../lib/blog/media-verification.ts";

test("authoritative template exposes a professional cover workflow without saved references or downloadable assets", async () => {
  const { data } = await blogJson({ data: BLOG_TEMPLATE }).json();
  assert.equal(Object.hasOwn(data, "savedReferences"), false);
  assert.equal(Object.hasOwn(data, "defaultAssets"), false);
  assert.equal(Object.hasOwn(LEGACY_BLOG_TEMPLATE, "savedReferences"), false);
  assert.doesNotMatch(JSON.stringify(data), /Cleiton Carvalho|Saved Reference Images|savedReferences|IDENTITY REFERENCE ONLY|drive\.google|sha256|get_blog_cover_assets|blog:\/\/assets/);
  const featured = data.slots.find((slot: { id: string }) => slot.id === "image-1").purpose;
  assert.match(featured, /Generate exactly one new featured cover in a professional editorial style/);
  assert.match(featured, /REQUIRED aspect ratio exactly 16:9/);
});

test("historical portrait and logo hashes remain recognized for validation only", () => {
  assert.deepEqual(officialCoverAssetIds("402a8a19611ca23af8916dac731cf1203da0389695b319a89545d78c85ac2d97"), ["default_cover_portrait"]);
  assert.deepEqual(officialCoverAssetIds("ca591ab564082f74572ec0885f5582e59632eeca20e5c900ba5ed3e54fb24871"), ["default_cover_portrait"]);
  assert.deepEqual(officialCoverAssetIds("8fe8c3315cd917bd1077e36bc6d67fce57aae8299c48d4010de819b8d8cc439d"), ["default_cover_logo"]);
  assert.deepEqual(officialCoverAssetIds("0".repeat(64)), []);
});

test("historical portrait bytes still cannot pass as a finished featured cover", async () => {
  const bytes = await readFile(new URL("../../public/images/team/cleiton-profile.png", import.meta.url));
  const id = "11111111-1111-4111-8111-111111111111";
  const media = { id, url: `/uploads/blog/${id}.png`, fileName: `${id}.png`, originalName: "portrait.png", alt: "Official portrait", type: "featured" as const, mimeType: "image/png" as const, size: bytes.length, width: 1254, height: 1254, createdAt: "2026-11-09T12:00:00Z" };
  const verify = createStoredImageVerifier(() => media, async () => ({ bytes }));
  await assert.rejects(verify({ id, url: media.url, alt: media.alt, type: "featured" }, true), error => error instanceof BlogError && error.code === "cover_source_asset");
});
