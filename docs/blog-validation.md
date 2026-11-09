# Authoritative blog validation and private preview

## Permanent CTA rule, template v3

The backend and MCP share `lib/blog/cta-policy.ts` / `src/cta-policy.ts`. Every CTA button label must contain **45–50 visible Unicode characters in the complete label**, including spaces and the exact final `" →"` (U+0020 space, U+2192 arrow). No character may follow the arrow. Example: `Automate missed calls and book more jobs today →` has 48 characters.

Count grapheme clusters using `Intl.Segmenter`, including combining accents and emoji as one visible character. The parser preserves the label exactly; trailing whitespace cannot be silently trimmed to make the suffix valid. Draft/legacy transport still allows up to 100 visible characters, so incomplete drafts can be saved and existing labels remain readable.

Each label must be unique within the post and directly related to its immediately preceding section. Existing duplicate normalization (Unicode, case, whitespace and punctuation) is retained. Context is explicit editorial guidance and requires human review.

`BLOG_TEMPLATE` v3 exposes `ctaButtonRules`; the legacy template remains v1. MCP `get_blog_template` exposes the same rules and `backendCtaRulesSupported`, including permanent generation guidance. For `editorial.policyVersion=1`, the following are **errors**, never merely warnings:

- `cta_label_length`: fewer than 45 or more than 50 characters, counting the complete label and suffix.
- `cta_label_suffix`: label does not end exactly with `" →"`.
- `repeated_cta`: duplicate button text in the same post.

Each issue identifies `blocks.<index>.label`, sets `valid=false` and blocks preview/publication. Existing compatibility remains: unmarked legacy posts receive these new issues as warnings, keep their previous template and are not rewritten. No database migration, CSS, visual component, form, image or link rule is changed by this CTA extension.

`tests/blog/cta.test.ts` covers 44/45/48/50/51-character boundaries, exact suffix and trailing whitespace, Unicode, duplicated labels, template metadata, persisted labels, preview/publish rejection and unchanged legacy records.

## CTA validation results, 2026-11-09

- Site: `npm run lint`, `tsc --noEmit` (local binary), `npm run build` and `npm test` passed; **105 tests passed, zero failures and zero skips**.
- MCP: lint, typecheck, build and full tests passed; **125 passed, one optional remote smoke skipped, zero failures** out of 126 tests, with both real-site integration tests enabled.
- Added 18 site cases and 21 MCP cases for the new CTA contract. Shared-policy sync and diff whitespace checks passed.
- No commit, push, deployment or production write was performed. No CSS, visual components, forms, images or link rules were changed. The automatic `next-env.d.ts` build diff was removed.

## Shared validation

`lib/blog/publication.ts` exports `validateBlogPost(post, checkImage)`, the shared
read-only validation used by `BlogService.validate` and `BlogService.publish`.
Storage access is injected through the same adapter used by publication before
this change: `readBlogImage`. Callers cannot supply editorial rules.

The existing rules remain authoritative:

- Required title, subtitle, excerpt, SEO title, meta description and focus keyword.
- Existing field types, maximum lengths, slug format, tags, image reference/UUID/
  URL/type/alt, CTA label/destination, provider/video id/title and supported form,
  all checked by the same parsers already used on writes.
- Approved template, exact slot ids/types/order: 25 default blocks, 10 texts, 6 H3 headings,
  4 CTAs, 4 internal images and final assessment form. A requested video adds its slot.
  Unmarked legacy posts retain the original 26-slot template with required video.
- Nonempty text/headings, required CTA labels, featured image, internal image references,
  distinct image ids (featured included) and the required top-level video.
- Every referenced image must exist and pass the existing storage reader's checks.

`collectPostFieldIssues` reuses the write-time parsers, including for saved legacy
or corrupted records. It does not normalize or save anything. No SEO minimum lengths or keyword-density constraints were added. Permanent
editorial policy is applied by `lib/blog/editorial-policy.ts`, including the CTA rules above.

The synchronous `validatePublication` editorial-only helper is retained for
existing callers/tests; its rules use the same collector. The production
validate/publish paths use the full asynchronous `validateBlogPost` function.

## POST /api/internal/blog/posts/{id}/validate

Bearer authentication, using existing `BLOG_API_READ_TOKEN` or
`BLOG_API_WRITE_TOKEN`. The additional internal capability `posts:validate` is
assigned to those two roles only. `BLOG_API_PUBLISH_TOKEN` receives 403 here,
despite retaining permission to read other existing resources. Admin cookies do
not authenticate this API. Authentication precedes body parsing and storage.

No body or `{}` validates the current saved revision. Optional JSON body:

```json
{ "revision": 3 }
```

When a body is present, use `Content-Type: application/json`. Only `revision` is
accepted; it must be a positive safe integer. Existing 512 KiB body limit applies.
No fields can be updated through this endpoint.

HTTP 200, using the existing internal API `data` envelope:

```json
{
  "data": {
    "valid": true,
    "postId": "11111111-1111-4111-8111-111111111111",
    "revision": 3,
    "errors": [],
    "warnings": []
  }
}
```

Editorial/storage rejection also returns HTTP 200, with structured errors:

```json
{
  "data": {
    "valid": false,
    "postId": "11111111-1111-4111-8111-111111111111",
    "revision": 3,
    "errors": [
      { "code": "required_image", "field": "featuredImage", "message": "A featured image is required." }
    ],
    "warnings": []
  }
}
```

Fields identify a post property or zero-based block position (`blocks.4.image`,
`blocks.2.level`, etc.). Input-parser errors may identify the whole property or
block (`featuredImage`, `blocks.4`); the message explains the failed constraint,
such as missing alt. Codes include `invalid_field`, `required_field`,
`invalid_template`, `required_image`, `missing_image`, `invalid_heading_level`,
`required_text`, `required_cta_text`, `required_video`, `invalid_image_count`,
`duplicate_image` and `editorial_template_pending`.

Editorial warnings include style suggestions and compatibility notices for legacy
posts. The shared validator checks available stored image references and merges
editorial issues without rewriting the post.
Unexpected storage/infrastructure errors are HTTP 500, not fabricated editorial
results, and do not expose paths or underlying error messages.

If the requested revision is stale, or any edit/publication/deletion happens during
asynchronous validation, the operation fails with 409 `revision_conflict` or 404
`post_not_found` instead of attesting a stale snapshot. HTTP/auth/input failures
use the existing `{ error: { code, message, details? } }` envelope and statuses.
Responses are `private, no-store`.

Validation changes no post, status, timestamps, revision, media, or publication
date. It does not create a preview token, session or permission to publish. A
published record may be checked for editorial readiness too; its workflow status
is not changed and the publish action still rejects already-published posts.

## Publication remains explicit

`POST /api/internal/blog/posts/{id}/publish` still requires the separate PUBLISH
credential and the mandatory JSON `{ "revision": 3 }`. The admin adapter continues
to map its `expectedRevision` input to that internal `revision` contract.

The service checks the revision, calls the same full validator, rejects
`valid: false`, and only then performs atomic compare-and-swap publication. The
repository checks the revision and draft status again when writing. Concurrent
edits cannot be overwritten or published as an earlier reviewed revision.

Existing HTTP/admin failures remain compatible: 422
`publication_validation_failed` or `missing_image`, with message strings in
`error.details`; 409 for revision/workflow conflicts. Template approval failure
retains 503 in publication. Create/update cannot set published status. Internal
and admin publication both call this shared service; repository writes are not
exposed as a separate API. No validation result bypasses later validation or CAS.

## GET /api/internal/blog/posts/{id}/preview

Uses the existing `posts:read` permission. Optional `?revision=3` must match the
current saved revision; unknown/duplicate query parameters are rejected.

```json
{
  "data": {
    "postId": "11111111-1111-4111-8111-111111111111",
    "revision": 3,
    "status": "draft",
    "previewUrl": "https://automasoluct.com/admin/blog/11111111-1111-4111-8111-111111111111/preview?revision=3",
    "requiresAdminLogin": true
  }
}
```

The origin comes from the already-validated `BLOG_ADMIN_ORIGIN` configuration,
not the request URL, Host or forwarded headers. Next may reconstruct a request
under an internal localhost URL behind the proxy; that URL is never used for
preview links. Local configuration returns the local admin URL; production must
already have the actual HTTPS admin origin configured. No new variable is added.
An unconfigured admin returns 503 instead of an unusable preview link.

The link points to the existing saved-revision admin preview. The human opens it
with their own admin login; the service/MCP receives no admin session, cookie,
password, CSRF token, public draft URL or shareable access token. Both the admin
layout and the page check the human session; the admin layout is noindex/nofollow.
The API response is `private, no-store` and adds `X-Robots-Tag: noindex, nofollow`.
Drafts remain absent from `/blog`, published queries and `/blog/{slug}`. Missing
posts return 404, stale revisions 409. Unsaved/historical revisions are not exposed.

## Tests and integration boundaries

`tests/blog/validation.test.ts` adds 29 tests covering full/invalid drafts, exact
template, required images/alt, slug, SEO/metadata, H3/CTAs/video/form, image storage,
revision checks, unchanged rows/timestamps/status, SQLite `query_only`, permission
separation, malformed input, conflicts, private preview and error redaction.
The existing admin/publication/media/foundation suites remain in place.

Run `npm run lint`, `npm run build`, `npm test` and `git diff --check`. Tests use
in-memory SQLite and temporary images only, with fictitious service tokens.

Verified locally on 2026-11-08: lint, build (including TypeScript), all 83 tests
(54 existing + 29 new), and diff whitespace checks passed. An additional real
HTTP smoke against the compiled Next server used a disposable database, images
and credentials: valid/invalid validation, empty streamed POST, permissions,
PUBLISH rejection, unchanged draft, private preview/login redirect, absent public
draft, invalid publish rejection and revision conflict all passed. The temporary
server was stopped and its data removed; no production database was used.

The companion MCP consumes the structured validation contract, applies the same
CTA policy to the saved revision and rejects invalid preview/publication even if
an older backend has not yet implemented the new rules. Do not infer readiness
from HTTP 200: check `data.valid`, `postId` and `revision`.
