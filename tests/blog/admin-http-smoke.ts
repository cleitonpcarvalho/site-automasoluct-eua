// Run after npm run build. All writes are confined to a disposable /tmp database.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createAdminAuth, getAdminConfig } from "../../lib/blog/admin/auth.ts";
import { toEditorFields } from "../../lib/blog/admin/editor.ts";
import { hashAdminPassword } from "../../lib/blog/admin/password.ts";
import { openBlogDatabase } from "../../lib/blog/database.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import type { BlogPost, ImageProvenance } from "../../lib/blog/types.ts";
import type { BlogMedia } from "../../lib/blog/media-types.ts";
import { completePostFixture } from "./fixtures.ts";

const directory = await mkdtemp(join(tmpdir(), "automa-blog-admin-"));
const data = join(directory, "data");
const uploads = join(directory, "uploads");
await mkdir(uploads);
const origin = "http://127.0.0.1:3104";
const login = "qa-only-editor";
const password = randomBytes(24).toString("hex");
const passwordHash = await hashAdminPassword(password);
const readToken = randomBytes(32).toString("hex");
const environment: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "production", BLOG_DATA_DIR: data, BLOG_UPLOAD_DIR: uploads, BLOG_ADMIN_ORIGIN: origin, BLOG_ADMIN_LOGIN: login, BLOG_ADMIN_PASSWORD_HASH: passwordHash, BLOG_API_READ_TOKEN: readToken, BLOG_API_WRITE_TOKEN: randomBytes(32).toString("hex"), BLOG_API_PUBLISH_TOKEN: randomBytes(32).toString("hex") };
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3104"], { cwd: process.cwd(), env: environment, stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
server.stdout.on("data", chunk => { logs += String(chunk); });
server.stderr.on("data", chunk => { logs += String(chunk); });
let cookie = "";
let csrf = "";
async function call(path: string, method = "GET", body?: unknown, authenticated = true, headers: Record<string, string> = {}) {
  const multipart = body instanceof FormData;
  return fetch(`${origin}${path}`, { method, redirect: "manual", headers: { Origin: origin, ...(body === undefined || multipart ? {} : { "Content-Type": "application/json" }), ...(authenticated && cookie ? { Cookie: cookie, "X-CSRF-Token": csrf } : {}), ...headers }, ...(body === undefined ? {} : { body: multipart ? body : JSON.stringify(body) }) });
}
async function readSitemap() {
  const response = await call("/sitemap.xml", "GET", undefined, false);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /xml/);
  const cacheControl = response.headers.get("cache-control") ?? "";
  assert.ok(/\bno-store\b/.test(cacheControl) || (/\bmax-age=0\b/.test(cacheControl) && /\bmust-revalidate\b/.test(cacheControl)));
  assert.doesNotMatch(cacheControl, /\b(?:s-maxage|max-age)=[1-9]\d*/);
  return [...(await response.text()).matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => ({
    url: match[1].match(/<loc>([^<]+)<\/loc>/)?.[1],
    lastModified: match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
    changeFrequency: match[1].match(/<changefreq>([^<]+)<\/changefreq>/)?.[1],
    priority: match[1].match(/<priority>([^<]+)<\/priority>/)?.[1],
  }));
}
async function uploadMedia(name: string, type = "other", provenance?: ImageProvenance): Promise<BlogMedia> {
  const form = new FormData();
  form.set("file", new File([new Uint8Array(await readFile("public/og-image.png"))], name, { type: "image/png" }));
  form.set("alt", "QA-only: Integração de operações e fluxos de trabalho no campo"); form.set("type", type);
  if (provenance) form.set("provenance", JSON.stringify(provenance));
  const response = await call("/api/admin/blog/media", "POST", form);
  assert.equal(response.status, 201, await response.clone().text()); return (await response.json()).data;
}
async function credentials() {
  const response = await call("/api/admin/login", "POST", { login, password }, false);
  assert.equal(response.status, 200);
  cookie = response.headers.get("set-cookie")!.split(";", 1)[0];
  assert.match(response.headers.get("set-cookie")!, /HttpOnly; SameSite=Strict/);
  const db = openBlogDatabase(join(data, "blog.sqlite"));
  try { csrf = createAdminAuth(db, getAdminConfig(environment)).session(cookie.split("=")[1])!.csrfToken; }
  finally { db.close(); }
}
async function completeDraft(slug: string, title: string) {
  const created = await call("/api/admin/blog/posts", "POST", { title, slug });
  assert.equal(created.status, 201); const post = (await created.json()).data as BlogPost;
  const fields = { ...completePostFixture(), slug, title };
  // Use real uploads of the existing local test asset, rather than unregistered
  // filesystem copies. This exercises the current image contract unchanged.
  for (const image of [fields.featuredImage!, ...fields.blocks.flatMap(block => block.type === "image" && block.image ? [block.image] : [])]) {
    const media = await uploadMedia(`qa-only-${slug}-${image.type}.png`, image.type, image.provenance);
    Object.assign(image, { id: media.id, url: media.url, alt: media.alt, provenance: media.provenance });
  }
  const closing = fields.blocks.find(block => block.id === "closing-text");
  if (closing?.type === "text") closing.content = "A long educational explanation that belongs earlier in the article. ".repeat(12);
  const saved = await call(`/api/admin/blog/posts/${post.id}`, "PATCH", { expectedRevision: post.revision, fields: toEditorFields({ ...post, ...fields }) });
  assert.equal(saved.status, 200, await saved.clone().text());
  return (await saved.json()).data as BlogPost;
}

function assertAssessmentMarkup(html: string) {
  assert.match(html, /<form[^>]*aria-label="Request a free assessment"/);
  for (const name of ["fullName", "businessName", "businessEmail", "phoneNumber", "budget"]) {
    assert.match(html, new RegExp(`<input\\b(?=[^>]*name="${name}")(?=[^>]*required)[^>]*>`));
  }
  assert.match(html, /<input\b(?=[^>]*name="businessEmail")(?=[^>]*type="email")[^>]*>/);
  assert.match(html, /<textarea\b(?=[^>]*name="workflow")(?=[^>]*required)[^>]*>/);
  for (const removed of ["Tell us about your workflow.", "Complete technical scope request. Direct engineer evaluation.", "What does your business do?", "Which systems are involved?"]) assert.ok(!html.includes(removed), removed);
}

function assertBlogConversion(html: string) {
  assertAssessmentMarkup(html);
  assert.match(html, /id="free-assessment"/);
  assert.equal((html.match(/<a\b[^>]*href="#free-assessment"/g) ?? []).length, 4);
  const closing = html.match(/<div[^>]*id="closing-text"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "";
  const paragraphs = [...closing.matchAll(/<p[^>]*>([^<]*)<\/p>/g)].map(match => match[1]);
  assert.equal(paragraphs.length, 2);
  assert.ok(paragraphs.every(paragraph => paragraph.length <= 280));
  assert.match(closing, /Submit the assessment below/);
}

try {
  let ready = false;
  for (let index = 0; index < 100; index++) {
    try { if ((await call("/admin/login", "GET", undefined, false)).status === 200) { ready = true; break; } } catch {}
    if (server.exitCode !== null) throw new Error(logs);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, logs);
  assert.deepEqual((await readSitemap()).map(entry => entry.url), ["/", "/jobber-automation", "/integrations", "/contact", "/privacy", "/terms"].map(path => new URL(path, "https://automasoluct.com").toString()));
  const publicLogin = await call("/admin/login", "GET", undefined, false);
  assert.match(publicLogin.headers.get("cache-control")!, /no-store/);
  assert.equal(publicLogin.headers.get("x-frame-options"), "DENY");
  for (const path of ["/admin", "/admin/blog", "/admin/blog/media", "/admin/blog/00000000-0000-0000-0000-000000000000", "/admin/blog/00000000-0000-0000-0000-000000000000/preview?revision=1"]) {
    const response = await call(path, "GET", undefined, false);
    assert.equal(response.status, 307, path); assert.equal(response.headers.get("location"), "/admin/login");
  }
  assert.equal((await call("/api/admin/blog/posts", "GET", undefined, false)).status, 401);
  assert.equal((await call("/api/admin/login", "POST", { login, password: "incorrect" }, false)).status, 401);
  await credentials();
  assert.equal((await call("/api/admin/blog/posts")).status, 200);
  assert.equal((await call("/api/admin/blog/media", "GET", undefined, false)).status, 401);
  assert.equal((await call("/api/admin/blog/media", "POST", new FormData(), false)).status, 401);
  assert.equal((await call("/api/admin/blog/media", "POST", new FormData(), true, { "X-CSRF-Token": "bad" })).status, 403);
  const uploaded = await uploadMedia("qa-only-http-roundtrip.png", "featured");
  assert.ok(uploaded.width > 0 && uploaded.height > 0 && uploaded.size > 0);
  assert.equal((await call("/admin/blog/media")).status, 200);
  assert.equal((await (await call("/api/admin/blog/media?q=qa-only-http-roundtrip")).json()).data.total, 1);
  assert.equal((await call(uploaded.url, "GET", undefined, false)).headers.get("content-type"), "image/png");
  assert.deepEqual(Buffer.from(await (await call(uploaded.url, "GET", undefined, false)).arrayBuffer()), await readFile("public/og-image.png"));
  assert.equal((await call(`/api/admin/blog/media/${uploaded.id}`, "PATCH", { alt: "QA-only updated alt" })).status, 200);
  const mediaPostResponse = await call("/api/admin/blog/posts", "POST", { title: "QA-only media association" });
  const mediaPost = (await mediaPostResponse.json()).data as BlogPost;
  const associatedFields = toEditorFields(mediaPost); associatedFields.featuredImage = { url: uploaded.url, alt: uploaded.alt };
  const associated = await call(`/api/admin/blog/posts/${mediaPost.id}`, "PATCH", { expectedRevision: 1, fields: associatedFields }); assert.equal(associated.status, 200);
  assert.equal((await call(`/api/admin/blog/media/${uploaded.id}`, "DELETE", { confirmation: uploaded.fileName })).status, 409);
  assert.equal((await (await call(`/api/admin/blog/media/${uploaded.id}`)).json()).data.usedBy[0].id, mediaPost.id);
  assert.equal((await call(`/api/admin/blog/posts/${mediaPost.id}`, "DELETE", { expectedRevision: 2, confirmation: mediaPost.slug })).status, 200);
  assert.equal((await call(`/api/admin/blog/media/${uploaded.id}`, "DELETE", { confirmation: uploaded.fileName })).status, 200);
  assert.equal((await call(uploaded.url, "GET", undefined, false)).status, 404);
  const internalForm = new FormData(); internalForm.set("file", new File([new Uint8Array(await readFile("public/og-image.png"))], "qa-only-api-client.png", { type: "image/png" })); internalForm.set("alt", "QA-only internal API upload"); internalForm.set("type", "other");
  assert.equal((await call("/api/internal/blog/media", "POST", internalForm, false, { Authorization: `Bearer ${environment.BLOG_API_WRITE_TOKEN}` })).status, 201);
  assert.equal((await call("/api/internal/blog/media", "GET", undefined, false, { Authorization: `Bearer ${readToken}` })).status, 200);
  assert.equal((await call("/api/admin/blog/posts", "POST", { title: "CSRF blocked" }, true, { "X-CSRF-Token": "bad" })).status, 403);
  assert.equal((await call("/api/admin/blog/posts", "POST", { title: "Origin blocked" }, true, { Origin: "https://attacker.test" })).status, 403);
  const post = await completeDraft("qa-only-admin-lifecycle", "QA-only private editorial draft");
  assert.ok((await readSitemap()).every(entry => !entry.url?.includes(post.slug)));
  const editor = await call(`/admin/blog/${post.id}`);
  assert.equal(editor.status, 200); const editorHtml = await editor.text();
  assert.equal((editorHtml.match(/data-editor-block=/g) ?? []).length, 26);
  for (const secret of [password, passwordHash, cookie.split("=")[1]]) assert.ok(!editorHtml.includes(secret));
  assert.equal((await call(`/blog/${post.slug}`, "GET", undefined, false)).status, 404);
  const opened = await call(`/api/admin/blog/posts/${post.id}`); assert.equal(opened.status, 200);
  assert.equal((await call(`/api/admin/blog/posts/${post.id}`, "PATCH", { expectedRevision: 1, fields: toEditorFields(post) })).status, 409);
  const preview = await call(`/admin/blog/${post.id}/preview?revision=${post.revision}`); assert.equal(preview.status, 200);
  const previewHtml = await preview.text();
  for (const block of post.blocks) assert.ok(previewHtml.includes(`id="${block.id}"`), block.id);
  assertBlogConversion(previewHtml);
  assert.deepEqual((await (await call(`/api/admin/blog/posts/${post.id}`)).json()).data.post, post);
  assert.equal((await call(`/api/internal/blog/posts/${post.id}/preview`, "GET", undefined, false, { Authorization: `Bearer ${readToken}` })).status, 200);
  assert.equal((await call(`/admin/blog/${post.id}/preview?revision=${post.revision}`, "GET", undefined, false)).status, 307);
  assert.ok((await (await call(`/admin/blog/${post.id}/preview?revision=1`)).text()).includes("Prévia desatualizada"));
  assert.equal((await call(`/api/admin/blog/posts/${post.id}/publish`, "POST", { expectedRevision: post.revision })).status, 400);
  const publish = await call(`/api/admin/blog/posts/${post.id}/publish`, "POST", { expectedRevision: post.revision, confirmation: post.slug }); assert.equal(publish.status, 200);
  const published = (await publish.json()).data as BlogPost;
  assert.deepEqual((await readSitemap()).find(entry => entry.url === `https://automasoluct.com/blog/${post.slug}`), {
    url: `https://automasoluct.com/blog/${post.slug}`, lastModified: published.updatedAt, changeFrequency: "monthly", priority: "0.6",
  });
  const publicArticle = await call(`/blog/${post.slug}`, "GET", undefined, false);
  assert.equal(publicArticle.status, 200); assertBlogConversion(await publicArticle.text());
  assert.equal((await call(`/api/admin/blog/posts/${post.id}`, "PATCH", { expectedRevision: published.revision, fields: toEditorFields(published) })).status, 409);
  const withdraw = await call(`/api/admin/blog/posts/${post.id}/draft`, "POST", { expectedRevision: published.revision, confirmation: post.slug }); assert.equal(withdraw.status, 200);
  const withdrawn = (await withdraw.json()).data as BlogPost;
  assert.ok((await readSitemap()).every(entry => !entry.url?.includes(post.slug)));
  assert.equal((await call(`/blog/${post.slug}`, "GET", undefined, false)).status, 404);
  assert.equal((await call(`/api/admin/blog/posts/${post.id}`, "DELETE", { expectedRevision: withdrawn.revision, confirmation: "wrong" })).status, 400);
  assert.equal((await call(`/api/admin/blog/posts/${post.id}`, "DELETE", { expectedRevision: 1, confirmation: post.slug })).status, 409);
  assert.equal((await call(`/api/admin/blog/posts/${post.id}`, "DELETE", { expectedRevision: withdrawn.revision, confirmation: post.slug })).status, 200);
  assert.equal((await call(`/api/admin/blog/posts/${post.id}`)).status, 404);
  assert.equal((await call("/api/internal/blog/posts", "GET", undefined, false, { Authorization: `Bearer ${readToken}` })).status, 200);
  assert.equal((await call("/api/internal/blog/posts/00000000-0000-0000-0000-000000000000", "DELETE", {}, true)).status, 405);
  assert.equal((await call("/api/admin/logout", "POST")).status, 200);
  assert.equal((await call("/api/admin/blog/posts")).status, 401);
  assert.equal((await call("/", "GET", undefined, false)).status, 200);
  assert.equal((await call("/blog", "GET", undefined, false)).status, 200);
  for (const path of ["/contact", "/jobber-automation"]) {
    const response = await call(path, "GET", undefined, false);
    assert.equal(response.status, 200); assertAssessmentMarkup(await response.text());
  }
  await credentials();
  let visualDraft = await completeDraft("qa-only-visual-draft", "QA-only: Connected field operations and practical integration planning for service businesses");
  const visualMedia = await uploadMedia("qa-only-featured-image-with-a-long-original-filename-to-check-mobile-wrapping-and-accessible-controls.png", "featured");
  const internalMedia = await uploadMedia("qa-only-internal-workflow.png", "internal");
  await uploadMedia("qa-only-library-image.png");
  const visualFields = toEditorFields(visualDraft); visualFields.featuredImage = { url: visualMedia.url, alt: visualMedia.alt };
  const firstImage = visualFields.blocks.find(block => block.type === "image"); if (firstImage?.type === "image") firstImage.image = { url: internalMedia.url, alt: internalMedia.alt };
  const visualSaved = await call(`/api/admin/blog/posts/${visualDraft.id}`, "PATCH", { expectedRevision: visualDraft.revision, fields: visualFields }); assert.equal(visualSaved.status, 200); visualDraft = (await visualSaved.json()).data;
  const visualPublished = await completeDraft("qa-only-visual-published", "QA-only published workflow");
  assert.equal((await call(`/api/admin/blog/posts/${visualPublished.id}/publish`, "POST", { expectedRevision: visualPublished.revision, confirmation: visualPublished.slug })).status, 200);
  // Seed an actual legacy record only in this disposable database. Rendering
  // must preserve its editorial contract and saved content.
  const legacyFields = { ...visualPublished, title: "QA-only legacy workflow", slug: "qa-only-legacy" }; delete legacyFields.editorial;
  const legacyDatabase = openBlogDatabase(join(data, "blog.sqlite"));
  const legacy = createPostRepository(legacyDatabase).createDraft(legacyFields); legacyDatabase.close();
  assert.equal((await call(`/api/admin/blog/posts/${legacy.id}/publish`, "POST", { expectedRevision: legacy.revision, confirmation: legacy.slug })).status, 200);
  const legacyBefore = (await (await call(`/api/admin/blog/posts/${legacy.id}`)).json()).data.post;
  const legacyPage = await call(`/blog/${legacy.slug}`, "GET", undefined, false);
  assert.equal(legacyPage.status, 200); assertBlogConversion(await legacyPage.text());
  assert.deepEqual((await (await call(`/api/admin/blog/posts/${legacy.id}`)).json()).data.post, legacyBefore);
  const recentSlugs: string[] = [];
  for (let index = 0; index < 9; index++) {
    const recent = await completeDraft(`qa-only-recent-${index}`, `QA-only recent workflow ${index}`);
    const published = await call(`/api/admin/blog/posts/${recent.id}/publish`, "POST", { expectedRevision: recent.revision, confirmation: recent.slug });
    assert.equal(published.status, 200, await published.clone().text()); recentSlugs.unshift(recent.slug);
  }
  for (const path of [`/blog/${visualPublished.slug}`, `/admin/blog/${visualDraft.id}/preview?revision=${visualDraft.revision}`]) {
    const response = await call(path, "GET", undefined, path.startsWith("/admin"));
    assert.equal(response.status, 200); const html = await response.text(); assertBlogConversion(html);
    const recentSection = html.match(/<section[^>]*aria-labelledby="recent-posts-heading"[\s\S]*?<\/section>/)?.[0] ?? "";
    const links = [...recentSection.matchAll(/<a\b[^>]*href="\/blog\/([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(links, recentSlugs.slice(0, 8));
    assert.ok(!recentSection.includes(visualDraft.slug));
    assert.ok(!recentSection.includes(`/blog/${visualPublished.slug}`));
    assert.ok(html.indexOf('id="free-assessment"') < html.indexOf('id="recent-posts-heading"'));
  }
  const sitemapEntries = await readSitemap();
  assert.equal(sitemapEntries.length, 17); // Six static pages and eleven published articles.
  for (const slug of [visualPublished.slug, legacy.slug, ...recentSlugs]) assert.ok(sitemapEntries.some(entry => entry.url === `https://automasoluct.com/blog/${slug}`));
  assert.ok(sitemapEntries.every(entry => !entry.url?.includes(visualDraft.slug) && !entry.url?.includes("/admin/")));
  assert.equal((await call(`/api/admin/blog/posts/${legacy.id}`, "DELETE", { expectedRevision: legacyBefore.revision, confirmation: legacy.slug })).status, 200);
  const afterPublishedDeletion = await readSitemap();
  assert.equal(afterPublishedDeletion.length, 16);
  assert.ok(afterPublishedDeletion.every(entry => entry.url !== `https://automasoluct.com/blog/${legacy.slug}`));
  const connection = join(directory, "browser-qa.json");
  await writeFile(connection, JSON.stringify({ origin, login, password, editorId: visualDraft.id, publishedId: visualPublished.id, editor: `/admin/blog/${visualDraft.id}`, preview: `/admin/blog/${visualDraft.id}/preview?revision=${visualDraft.revision}` }), { mode: 0o600 });
  console.log(JSON.stringify({ passed: ["protected server pages and API", "real scrypt login", "cookie secrecy and logout", "CSRF/Origin", "create/list/editor/save/conflict", "private exact-revision preview", "explicit publication/withdrawal", "confirmed CAS deletion", "media multipart upload/list/get/alt", "media association and safe deletion", "exact public image bytes and MIME", "internal bearer media API", "internal API preserved", "home/public blog"], browserConnectionFile: connection, isolated: true }));
  // npm and the terminal can both forward SIGINT; keep cleanup alive on duplicates.
  if (process.argv.includes("--keep-alive")) await new Promise<void>(resolve => { process.on("SIGINT", () => resolve()); process.on("SIGTERM", () => resolve()); });
} catch (error) { console.error(error); process.exitCode = 1; }
finally {
  if (server.exitCode === null) {
    const exited = new Promise(resolve => server.once("exit", resolve)); server.kill("SIGTERM");
    await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 1500))]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
  await rm(directory, { recursive: true, force: true });
}
