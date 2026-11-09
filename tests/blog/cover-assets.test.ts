import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { DEFAULT_ASSETS, officialCoverAssetIds } from "../../lib/blog/cover-asset-metadata.ts";
import { BLOG_TEMPLATE, LEGACY_BLOG_TEMPLATE } from "../../lib/blog/template.ts";
import { blogJson } from "../../lib/blog/http.ts";
import { BlogError } from "../../lib/blog/errors.ts";
import { createStoredImageVerifier } from "../../lib/blog/media-verification.ts";

test("authoritative template exposes both canonical public Google Drive cover files", async () => {
  const response = blogJson({ data: BLOG_TEMPLATE });
  const { data } = await response.json();
  assert.deepEqual(data.defaultAssets, DEFAULT_ASSETS);
  assert.equal(data.defaultAssets.default_cover_portrait.url, "https://drive.google.com/file/d/16E9m_oWHJxr54ST_NddqMYevefB9Zvn_/view");
  assert.equal(data.defaultAssets.default_cover_logo.url, "https://drive.google.com/file/d/1hrYGGW0M1h3PEQdFby3HuouIQPWNzwB7/view");
  assert.deepEqual(Object.values(DEFAULT_ASSETS).map(asset => asset.mimeType), ["image/png", "image/png"]);
  assert.ok(Object.values(DEFAULT_ASSETS).every(asset => asset.usage === "cover_only"));
  assert.ok(!JSON.stringify(data.defaultAssets).includes("automasoluct.com"));
  assert.equal(Object.hasOwn(LEGACY_BLOG_TEMPLATE, "defaultAssets"), false);
  assert.match(data.slots.find((slot: { id: string }) => slot.id === "image-1").purpose, /STOP featured generation/);
});

test("new canonical and historical portrait hashes remain recognized without delivery fallback", () => {
  assert.deepEqual(officialCoverAssetIds(DEFAULT_ASSETS.default_cover_portrait.sha256), ["default_cover_portrait"]);
  assert.deepEqual(officialCoverAssetIds("ca591ab564082f74572ec0885f5582e59632eeca20e5c900ba5ed3e54fb24871"), ["default_cover_portrait"]);
  assert.deepEqual(officialCoverAssetIds(DEFAULT_ASSETS.default_cover_logo.sha256), ["default_cover_logo"]);
  assert.deepEqual(officialCoverAssetIds("0".repeat(64)), []);
});

test("historical portrait bytes still cannot pass as a finished featured cover", async () => {
  const bytes = await readFile(new URL("../../public/images/team/cleiton-profile.png", import.meta.url));
  const id = "11111111-1111-4111-8111-111111111111";
  const media = { id, url: `/uploads/blog/${id}.png`, fileName: `${id}.png`, originalName: "portrait.png", alt: "Official portrait", type: "featured" as const, mimeType: "image/png" as const, size: bytes.length, width: 1254, height: 1254, createdAt: "2026-11-09T12:00:00Z" };
  const verify = createStoredImageVerifier(() => media, async () => ({ bytes }));
  await assert.rejects(verify({ id, url: media.url, alt: media.alt, type: "featured" }, true), error => error instanceof BlogError && error.code === "cover_source_asset");
});
