# Blog foundation

The original foundation stage added persistent posts, an internal HTTP API and public server-rendered pages. Human authentication and the subsequent administrative panel are documented in [blog-admin.md](blog-admin.md); validated HTTP uploads and the media library are documented in [blog-media.md](blog-media.md). MCP, AI generation, old-post migration and automatic publication remain outside the implementation. No sample posts are seeded into the real database.

## Layers

- `lib/blog/types.ts`: post, image, video, ordered block and pagination contracts.
- `lib/blog/template.ts`: the single editorial template definition, including versioned slot ids and order. The future `get_blog_template` MCP tool can call the protected template endpoint; it does not need database access.
- `lib/blog/validation.ts` / `publication.ts`: shared input and authoritative publication validation. `validateBlogPost` checks the exact same editorial requirements and stored images for standalone validation and publication. Drafts may be incomplete; publication requires a complete valid template and available images. See [blog-validation.md](blog-validation.md).
- `lib/blog/database.ts` / `migrations.ts` / `repository.ts`: SQLite, transactional schema migrations and parameterized persistence.
- `lib/blog/service.ts`: shared application operations, independent of HTTP. Public pages call its published-only methods; internal controllers call its mutation methods.
- `lib/blog/auth.ts` / `http.ts` / `handlers.ts`: service authentication, permissions, bounded JSON bodies and consistent responses. The human panel uses a separate session adapter over the same blog service; the service-token boundary is unchanged.
- `components/blog/`: public block, card, image and metadata rendering. Text is plain text escaped by React; arbitrary HTML, iframe markup and executable blocks are not accepted.

## Runtime and persistence

Requires **Node 24+**. Uses built-in `node:sqlite`, without an ORM or native npm driver. The only added runtime package is the React `server-only` marker, which prevents importing storage/authentication into browser code.

| Setting | Local default | Docker runtime |
| --- | --- | --- |
| `BLOG_DATA_DIR` | `./data/blog` | `/app/data/blog` |
| SQLite file | `<BLOG_DATA_DIR>/blog.sqlite` | Named volume `blog-data` |
| `BLOG_UPLOAD_DIR` | `./uploads/blog` | `/app/uploads/blog`, volume `blog-uploads` |
| Public image prefix | `/uploads/blog/` | Served by a Node route handler |

Storage is created on first database access. `npm run blog:migrate` applies migrations explicitly if desired. Migrations also run automatically and transactionally when a connection opens; they never seed or publish posts. Pages and APIs are dynamic, so the build does not create or bake a database into the image.

SQLite uses WAL, a 5-second busy timeout and FULL synchronous mode. The Docker runner prepares writable directories for uid 1001. Database files and runtime uploads are ignored by Git and excluded from Docker build contexts. No credentials or data enter the build image.

This design targets the current single-site VPS with local disk. Preserve both named volumes when recreating a container. Do not use `docker compose down -v` to redeploy. For database backups, use SQLite's online backup API (`node:sqlite` `backup`) or stop the writer before copying; copying only the main file during WAL writes is not a complete backup. Back up the upload volume too. Multiple replicas/distributed storage should move to a managed database in a later stage.

## Schema (migration 1)

`blog_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)` records applied versions.

`blog_posts` is a STRICT table:

| SQL column | Public/API field | Storage |
| --- | --- | --- |
| `id` | `id` | TEXT UUID, primary key |
| `title`, `subtitle`, `slug` | Same | TEXT; slug unique |
| `seo_title` | `seoTitle` | TEXT |
| `meta_description` | `metaDescription` | TEXT |
| `focus_keyword` | `focusKeyword` | TEXT |
| `excerpt` | `excerpt` | TEXT |
| `featured_image` | `featuredImage` | JSON object or NULL |
| `blocks` | `blocks` | Ordered JSON array |
| `video` | `video` | JSON object or NULL |
| `tags` | `tags` | JSON array |
| `status` | `status` | `draft` or `published`, checked by SQLite |
| `revision` | `revision` | Positive INTEGER, starts at 1 |
| `created_at`, `updated_at`, `published_at` | `createdAt`, `updatedAt`, `publishedAt` | UTC ISO 8601 TEXT; publishedAt NULL for drafts |

Indexes support publication-date listing and updated-date internal listing. SQL CHECK constraints enforce JSON validity, array shape, status, revision and publication timestamp consistency. Revision is an optimistic-concurrency counter, not a full edit-history archive.

## Images and video

An image reference is `{ id, url, alt, type }`, with a UUID id, required alt and type `featured` or `internal`. Example URL: `/uploads/blog/550e8400-e29b-41d4-a716-446655440000.webp`. The filename id must match the reference id. Legacy files support JPEG, PNG, WebP and AVIF; the public reader has a 25 MiB hard ceiling. New uploads accept PNG/JPEG/WebP with a configurable 10 MiB default; see [blog-media.md](blog-media.md). SVG and arbitrary paths are not served. The media route checks confinement (including symlinks), file size, file signatures and MIME type, and sends `nosniff`.

Validated upload endpoints and a metadata catalog have since been added; see [blog-media.md](blog-media.md) for current limits and formats. URLs are public assets; never put private documents or credentials there. Images are served at runtime, outside `public/`, so uploads do not require an application rebuild. Publication checks that all referenced files exist and are valid.

`video` is `null` for incomplete drafts, or `{ provider: "youtube" | "vimeo", id, title }`. The approved template requires one video for publication. The `video` block uses this top-level reference. Only valid provider ids are accepted; rendering builds a fixed YouTube privacy-enhanced or Vimeo embed URL, with no autoplay and no arbitrary iframe HTML.

## Editorial template and blocks

The exact user-approved sequence is fixed in `lib/blog/template.ts`, version 1, with 26 slots:

1. Introduction (text)
2. CTA 1
3. Heading 1 (H3)
4. Text
5. Internal image 1
6. Heading 2 (H3)
7. Text
8. CTA 2
9. Internal image 2
10. Text
11. CTA 3
12. Heading 3 (H3)
13. Text
14. Internal image 3
15. Heading 4 (H3)
16. Text
17. CTA 4
18. Internal image 4
19. Text
20. Heading 5 (H3)
21. Text
22. Video (required)
23. Text
24. Heading 6 (H3)
25. Final text
26. Final assessment form

This is 4 CTAs, 4 internal images, 6 H3 headings, 10 text blocks including the introduction, 1 video and 1 final form. The main title, subtitle, excerpt, featured image and SEO metadata are outside this sequence. No slot is optional in this approved version; drafts can be incomplete, but cannot be published until complete.

Supported block contracts:

```ts
{ id, type: "text", content }
{ id, type: "heading", content, level: 2 | 3 }
{ id, type: "cta", text, label, href }
{ id, type: "image", image: { id, url, alt, type: "internal" }, caption? }
{ id, type: "video" } // source: post.video
{ id, type: "form", formId: "assessment" }
```

Array order is rendering order. Block ids are unique editorial slot names, not array indexes. Publication validates ids, types, exact order, required text, four distinct internal images, a separate featured image, the required video, all H3 levels and the final form slot. Do not edit a released template version without considering already-published posts.

The form block reuses the current `ContactAssessmentForm` and its existing Turnstile/webhook flow. An optional `compactVerification` prop is enabled only by the blog, selecting Turnstile's supported 150px compact widget so it fits in 320px layouts; existing callers retain their original configuration. Blog-local styling gives buttons and inputs a minimum 44px height. No submission endpoint or provider is added. Existing attribution remains `/contact`; blog-specific attribution can be added deliberately in a later stage.

## Authentication and API

All `/api/internal/blog/*` routes are protected, including draft reads and the template. No credential is configured automatically. With no valid configuration, the internal API returns 503. Credentials must be **distinct**, random server secrets of at least 32 characters. Generate each independently (for example `openssl rand -hex 32`), store in server environment, and send only over HTTPS as `Authorization: Bearer <secret>`. Never expose them as `NEXT_PUBLIC_*`, in browser storage or URL queries.

| Variable | Permissions |
| --- | --- |
| `BLOG_API_READ_TOKEN` | Read posts/template/preview and validate without publishing |
| `BLOG_API_WRITE_TOKEN` | Read, validate and create/update drafts; cannot publish |
| `BLOG_API_PUBLISH_TOKEN` | Read and explicitly publish; cannot edit or call standalone validation |

Only configure the roles needed. A future MCP client should start with write permission, without the publication credential. The internal service API accepts no session cookies and enables no permissive CORS. Human login now exists separately at `/admin/login`; its scoped cookie/CSRF architecture and environment configuration are described in [blog-admin.md](blog-admin.md). Multi-user management and credential rotation UI remain deferred.

| Method | Endpoint | Permission | Result |
| --- | --- | --- | --- |
| GET | `/api/internal/blog/posts?page=1&pageSize=20&status=draft` | Read | `{ data: { items, total, page, pageSize } }`; status optional, pageSize ≤100 |
| GET | `/api/internal/blog/posts/[id]` | Read | Full post by UUID |
| POST | `/api/internal/blog/posts` | Write | Create draft, revision 1, 201 + Location |
| PATCH | `/api/internal/blog/posts/[id]` | Write | Partial update with required current `revision` |
| POST | `/api/internal/blog/posts/[id]/validate` | Read or Write (`posts:validate`) | `{ data: { valid, postId, revision, errors, warnings } }`; optional `{ revision }`; never writes/publishes |
| GET | `/api/internal/blog/posts/[id]/preview?revision=1` | Read | Saved-revision admin preview URL; revision guard optional, human login required |
| POST | `/api/internal/blog/posts/[id]/publish` | Publish | Explicit publication with `{ revision }` |
| GET | `/api/internal/blog/template` | Read | Central template definition |

Create example (no publication):

```json
{ "title": "A working title", "slug": "a-working-title", "tags": ["Jobber"] }
```

Update example:

```json
{ "revision": 1, "subtitle": "A subtitle for review", "blocks": [] }
```

`id`, dates and revision increments are server-controlled. A slug is derived from the title when omitted at creation, and conflicts return 409. Updates replace supplied arrays in full and preserve omitted fields. They cannot set `status: "published"`. To edit an already-published post, explicitly send `status: "draft"` plus its current revision; this **withdraws it from public pages** and clears publishedAt. The next publication requires the separate publish operation and credential. Until a future staged-revision workflow exists, there is no silent editing of live content.

Errors use `{ error: { code, message, details? } }`. Statuses: 400 invalid input, 401 missing/invalid credential, 403 insufficient role, 404 absent post, 409 slug/revision/workflow conflict, 413 body >512 KiB, 415 non-JSON body, 422 incomplete editorial content/missing media, 503 unconfigured authentication/template. Internal responses are `private, no-store`; errors never include SQL, filesystem paths or secrets. Revision checks run again atomically after publication media validation to avoid racing an edit.

Standalone validation uses HTTP 200 for both `valid: true` and `valid: false` and structured `{ code, field, message }` issues; transport/authentication/conflict failures retain the standard HTTP error envelope. It checks the saved revision again after asynchronous media reads. The permission `posts:validate` is assigned to existing READ/WRITE credentials only, explicitly excluding PUBLISH. No new environment variables or credentials are needed. [Full validation and private-preview contract](blog-validation.md).

## Public pages and validation

- `/blog`: newest published post featured, remaining posts in a mobile-first grid, dates, excerpts, images, optional tags, pagination (10/page), and a genuine empty state.
- `/blog/[slug]`: published posts only, ordered block renderer, publication metadata, transparent-safe image fitting, responsive video and the existing assessment form. Drafts/missing slugs return 404 and do not expose draft metadata.
- Header/footer/home/navigation and the existing sitemap are unchanged in this stage. Blog discovery/navigation and sitemap updates can accompany the first reviewed publication.

There were no existing automated tests or test script in the project. `npm test` now runs isolated tests with Node's built-in runner, using only memory/temporary databases and media. Tests do not seed, publish or submit forms in the real site. The `react-server` condition allows server-only modules in the test process. Standard checks: `npm test`, `npm run lint`, `npm run build`, `git diff --check`.

## Next stage

The follow-up responsive review upgraded Next.js and eslint-config-next from `16.3.8` to `16.4.5`, keeping React/React DOM at `19.3.0`. The production-dependency audit now reports zero vulnerabilities, including resolution of the [cache-component advisory](https://github.com/advisories/GHSA-673q-mjm6-r5xr). See [the responsive review and upgrade report](blog-responsive-upgrade.md) for compatibility, breakpoint results and validation limits.

1. Review real editorial content, images and video before the first publication; the responsive review used isolated test fixtures.
2. Provision persistent volumes, separate credentials and backups on the VPS during an explicitly authorized deployment.
3. The authenticated panel and private saved-revision preview are implemented. Add staged revisions separately if live posts must stay online during edits; the current workflow explicitly withdraws a published post before editing it.
4. Validated upload service completed in [blog-media.md](blog-media.md); any future MCP upload client must reuse it.
5. Implement MCP as an API client with scoped credentials and explicit human publication approval; no AI integration is present now.

## Change manifest

New files:

- `.env.example`
- `app/api/internal/blog/posts/[id]/publish/route.ts`
- `app/api/internal/blog/posts/[id]/route.ts`
- `app/api/internal/blog/posts/route.ts`
- `app/api/internal/blog/template/route.ts`
- `app/blog/[slug]/page.tsx`
- `app/blog/not-found.tsx`
- `app/blog/page.tsx`
- `app/uploads/blog/[filename]/route.ts`
- `components/blog/BlogBlocks.tsx`
- `components/blog/BlogImage.tsx`
- `components/blog/PostCard.tsx`
- `components/blog/PostMeta.tsx`
- `docs/blog-foundation.md`
- `lib/blog/auth.ts`
- `lib/blog/config.ts`
- `lib/blog/database.ts`
- `lib/blog/errors.ts`
- `lib/blog/handlers.ts`
- `lib/blog/http.ts`
- `lib/blog/media.ts`
- `lib/blog/migrations.ts`
- `lib/blog/publication.ts`
- `lib/blog/repository.ts`
- `lib/blog/service.ts`
- `lib/blog/template.ts`
- `lib/blog/types.ts`
- `lib/blog/validation.ts`
- `scripts/blog/migrate.ts`
- `tests/blog/fixtures.ts`
- `tests/blog/foundation.test.ts`
- `tests/blog/publication.test.ts`

Changed existing files:

- `.dockerignore`
- `.gitignore`
- `Dockerfile`
- `components/forms/TurnstileWidget.tsx`
- `components/sections/contact/ContactAssessmentForm.tsx`
- `docker-compose.yml`
- `package-lock.json`
- `package.json`
- `tsconfig.json`
