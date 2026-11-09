// Intentionally separate from unit tests: this regression builds the production
// artifact with no blog database, then runs the same standalone server as Docker.
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { openBlogDatabase } from "../../lib/blog/database.ts";
import { createPostRepository } from "../../lib/blog/repository.ts";
import { completePostFixture } from "./fixtures.ts";

async function stop(child: ChildProcess | undefined) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise<void>(resolve => child.once("exit", () => resolve()));
  child.kill("SIGTERM");
  await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 1500))]);
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
    await exited;
  }
}

test("standalone sitemap uses runtime-only published data after a build without blog data", { timeout: 120_000 }, async t => {
  const root = process.cwd();
  const directory = await mkdtemp(join(tmpdir(), "automa-sitemap-runtime-"));
  const buildData = join(directory, "build-data");
  const runtimeData = join(directory, "runtime-data");
  const resources: { builder?: ChildProcess; server?: ChildProcess; database?: ReturnType<typeof openBlogDatabase> } = {};
  t.after(async () => {
    await stop(resources.server);
    await stop(resources.builder);
    resources.database?.close();
    await rm(directory, { recursive: true, force: true });
  });

  const buildOutput: string[] = [];
  const builder = resources.builder = spawn("npm", ["run", "build"], {
    cwd: root,
    env: { ...process.env, BLOG_DATA_DIR: buildData, BLOG_UPLOAD_DIR: join(directory, "build-uploads") },
    stdio: ["ignore", "pipe", "pipe"],
  });
  builder.stdout?.on("data", chunk => { buildOutput.push(String(chunk)); process.stdout.write(chunk); });
  builder.stderr?.on("data", chunk => { buildOutput.push(String(chunk)); process.stderr.write(chunk); });
  const buildCode = await new Promise<number | null>((resolve, reject) => {
    builder.once("error", reject);
    builder.once("exit", resolve);
  });
  assert.equal(buildCode, 0, buildOutput.join(""));
  assert.equal(existsSync(join(buildData, "blog.sqlite")), false, "Build must not open or create a blog database.");
  const manifest = JSON.parse(await readFile(join(root, ".next/prerender-manifest.json"), "utf8"));
  assert.equal(Object.hasOwn(manifest.routes, "/sitemap.xml"), false, "Sitemap must not be a prerendered artifact.");

  // These disposable fixtures do not exist until AFTER the production build.
  // Writes go through the repository only to isolate sitemap behavior from media.
  const database = resources.database = openBlogDatabase(join(runtimeData, "blog.sqlite"));
  const repository = createPostRepository(database);
  const draft = repository.createDraft(completePostFixture(false));
  const first = repository.publish(draft.id, draft.revision);
  const unpublished = repository.createDraft(completePostFixture(false));
  const canonical = (slug: string) => `https://automasoluct.com/blog/${slug}`;

  const origin = "http://127.0.0.1:3106";
  const serverOutput: string[] = [];
  const server = resources.server = spawn(process.execPath, ["server.js"], {
    cwd: join(root, ".next/standalone"),
    env: { ...process.env, NODE_ENV: "production", HOSTNAME: "127.0.0.1", PORT: "3106", BLOG_DATA_DIR: runtimeData, BLOG_UPLOAD_DIR: join(directory, "runtime-uploads") },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout?.on("data", chunk => serverOutput.push(String(chunk)));
  server.stderr?.on("data", chunk => serverOutput.push(String(chunk)));
  server.on("error", error => serverOutput.push(String(error)));

  let response: Response | undefined;
  for (let attempt = 0; attempt < 100; attempt++) {
    assert.equal(server.exitCode, null, serverOutput.join(""));
    try {
      response = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(1000) });
      break;
    } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  assert.ok(response, serverOutput.join(""));

  async function entries(result?: Response) {
    const current = result ?? await fetch(`${origin}/sitemap.xml`);
    assert.equal(current.status, 200, serverOutput.join(""));
    assert.match(current.headers.get("content-type") ?? "", /xml/);
    assert.doesNotMatch(current.headers.get("cache-control") ?? "", /\b(?:s-maxage|max-age)=[1-9]\d*/);
    return [...(await current.text()).matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => ({
      url: match[1].match(/<loc>([^<]+)<\/loc>/)?.[1],
      lastModified: match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
      changeFrequency: match[1].match(/<changefreq>([^<]+)<\/changefreq>/)?.[1],
      priority: match[1].match(/<priority>([^<]+)<\/priority>/)?.[1],
    }));
  }

  const initial = await entries(response);
  const staticUrls = ["/", "/jobber-automation", "/integrations", "/contact", "/privacy", "/terms"].map(path => new URL(path, "https://automasoluct.com").toString());
  assert.equal(initial.length, 7);
  assert.deepEqual(initial.slice(0, 6).map(entry => entry.url), staticUrls);
  assert.deepEqual(initial.find(entry => entry.url === canonical(first.slug)), {
    url: canonical(first.slug), lastModified: first.updatedAt, changeFrequency: "monthly", priority: "0.6",
  });
  assert.ok(initial.every(entry => entry.url !== canonical(unpublished.slug)));
  t.diagnostic(`Runtime-only published URL verified in /sitemap.xml: ${canonical(first.slug)}`);

  // The same running process must see new publications and removals immediately.
  const second = repository.publish(unpublished.id, unpublished.revision);
  const afterPublication = await entries();
  assert.equal(afterPublication.length, 8);
  assert.ok(afterPublication.some(entry => entry.url === canonical(second.slug)));
  repository.update(first.id, { revision: first.revision, changes: {}, status: "draft" });
  assert.ok((await entries()).every(entry => entry.url !== canonical(first.slug)));
  repository.remove(second.id, second.revision);
  const afterRemoval = await entries();
  assert.deepEqual(afterRemoval.map(entry => entry.url), staticUrls);
});
