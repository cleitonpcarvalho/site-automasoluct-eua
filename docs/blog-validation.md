# Authoritative blog validation and private preview

## Canonical featured references: ChatGPT Saved Reference Images

`GET /api/internal/blog/template` exposes `savedReferences` from `lib/blog/saved-cover-references.ts`:

- `Cleiton Carvalho`: founder identity reference only. Preserve exact facial identity, recognizable features, beard, hair and person identity.
- `Automa Soluct`: official logo reference. Preserve the exact logo.

Select both named saved references in the ChatGPT image generator. If either is unavailable to that generator, DO NOT generate the featured image; report the missing reference by name. Never invent or substitute a person or logo. No downloaded file, URL or MCP image block substitutes for a required saved reference.

Google Drive cover downloads, cover URLs/hashes in template guidance, the `get_blog_cover_assets` tool and its PNG resources have been removed. General Google Drive upload/import support remains unchanged. Historical source hashes and `default_cover_portrait` / `default_cover_logo` provenance IDs remain internal validation compatibility data, never generation sources.

The MCP strictly validates the optional `savedReferences` wire field. It privately accepts the previous optional `defaultAssets` wire object for older deployed sites but strips it from tool output. Article structure, exact 16:9 rules, upload transport, CTA/conversion and publication behavior remain unchanged.

## Native ChatGPT image workflow (template v4)

Image generation happens in the ChatGPT conversation, not inside the MCP. The MCP only uploads and associates real image files.

If image generation is unavailable in the current ChatGPT session, stop the image workflow and report it instead of proceeding with fake or missing image references.

The MCP has no generation endpoint or API-key configuration. `get_blog_template` accepts `{}` and provides host instructions; it does not accept availability flags or determine saved-reference availability. Missing saved references stop featured generation. Actual native generation failure and generated-file transport failure remain separate host reports, not conclusions inferred from MCP tools/list.

Every generated featured cover and each of the four generated body images MUST use exactly **16:9**, landscape only. Explicitly request 16:9 in every native generation operation. Never generate 1:1, 4:3, portrait or 9:16 images. Each body image is one standalone image in a separate native operation, waiting for each result; no collage, multi-panel layout or article mockup, and no added logos, Automa Soluct branding, founder portrait or decorative text. User-supplied screenshots retain their existing upload support.

The image-generation rules in `GET /api/internal/blog/template` continue using the existing image-slot `purpose` strings, with the featured-cover instruction included in `image-1.purpose`. `IMAGE_WORKFLOW_POLICY.instructions`, `IMAGE_WORKFLOW_STEPS` and `EDITORIAL_GUIDANCE.images` repeat the same requirement. The MCP adds its own `imageWorkflow` object locally, so its generation instructions also need the same wording. Canonical saved-reference metadata uses the strict `savedReferences` wire field documented above. Upload verification and publishing behavior are unchanged.

## Permanent image-generation guidance

The site and MCP keep identical instruction text in `lib/blog/image-generation-guidance.ts` / `src/image-generation-guidance.ts`. The site exposes all six rules through the existing `image-1.purpose` string and the body-image rule through all four image slots. Both workflow instructions and `EDITORIAL_GUIDANCE.images` include the same text. These generation instructions use existing purpose strings and do not change validation, upload, Google Drive import, CTA, conversion or publishing behavior. The savedReferences wire field is documented above.

- **Featured portrait:** the `Cleiton Carvalho` saved reference is an IDENTITY REFERENCE ONLY; never copy the original crossed-arms pose. Preserve the exact recognizable person and official logo, but vary pose, expression, head angle, body angle, hand position, framing, placement and composition for the article. Technical topics should look focused/confident/thoughtful; growth positive/energetic/confident; problems serious/attentive/concerned; education approachable/professional; operations decisive/engaged/professional. Avoid repeated crossed arms, straight-on headshots, neutral expressions, position and crop. Keep gestures realistic; no exaggeration, caricature, theatrical expressions or unnatural poses. This variation rule applies only to the featured cover.
- **Visual review before presentation:** visually inspect every cover against the saved references and article context. Reject and regenerate wrong person/logo, copied crossed-arms pose, context-inappropriate pose/expression or invented/distorted/substituted logo. Inspect every regenerated result and never present a failed cover as valid.
- **Body visuals:** each of the four images is exactly 16:9, standalone and generated in its own native operation, waiting for each result. They are natural editorial/supporting visuals, never thumbnails or covers. No headline, title, subtitle, CTA, text overlay, large typography, logo, Automa Soluct branding or founder portrait. No collage, multi-panel layout, screenshot montage or article mockup. Text is allowed only when inherent in a real UI/system screenshot supplied by the user; never invent decorative text.
- **Real screenshots:** prioritize relevant supplied software/dashboard/Jobber/n8n/CRM/workflow/spreadsheet/browser/app/terminal screenshots. Keep UI and data faithful. Only subtle dark backgrounds, minimal frames, spacing/crop/zoom, readable perspective, shadow and breathing room are allowed; pad to a 16:9 canvas without stretching the UI. No excessive graphics, arrows everywhere, colorful decorations, fake dashboards, redrawn UI, invented elements, altered data, thumbnail treatment, large text or visual noise.
- **Privacy before use:** inspect every supplied screenshot before generation, upload or article use. Redact emails, phone numbers, customer names/addresses, API keys, tokens, passwords, secrets/credentials, account IDs, invoice/customer identifiers, private financial data, credential-bearing private URLs and other private information. Use opaque redaction or strong flattened blur so values cannot be read or recovered. Keep surrounding UI clean/useful, do not fabricate replacements, and do not unnecessarily blur public UI labels, public company names or non-sensitive elements.
- **Section-specific priority:** relevant real user screenshot first, useful clean diagram/system visualization second, related realistic editorial image third. Do not force unrelated screenshots or unnecessary diagrams.

The existing exactly-one-cover/four-body-images requirement and exactly-16:9 rule remain permanent. Screenshot inspection and redaction are host image-preparation instructions; existing server verification and media handling remain intact.

Required MCP flow: template → select Cleiton Carvalho and Automa Soluct saved references → article in conversation → native 16:9 cover → inspect/reject/regenerate before presentation → four body files → user visual review/approval → obtain real files → five confirmed uploads → create/update draft → exact returned references → associate → reread saved draft → confirm 5/5 associations → validate 5/5 persisted files → preview → publish only on explicit request.

`lib/blog/media-verification.ts` requires registered media for policy posts, matching id/URL/role, a readable file, matching byte count and a complete image decode matching its stored dimensions and MIME. Named placeholders, one-pixel stand-ins and exact official portrait/logo bytes used as a finished cover are rejected. It never generates or repairs an image. Legacy unmarked posts retain their previous filesystem-reference compatibility.

Validation returns `imageStatus` with expected/associated/verified counts, verified fields, missing/placeholder fields and a complete flag. Associated references alone do not prove an upload exists. `media_upload_unconfirmed`, `media_reference_mismatch`, `media_content_mismatch`, `image_placeholder`, `cover_source_asset` and missing-image errors block readiness and preview. No new database migration or UI/CSS/form changes are needed.

The server can verify bytes, registry entries and explicit placeholder indicators. It cannot recognize every semantic fake image or independently prove that a file was generated by the native ChatGPT tool. Visual composition and content remain review steps.

## Saved-reference workflow validation results, 2026-11-09

- Site: `npm run lint`, `./node_modules/.bin/tsc --noEmit`, `npm run build` and `npm test` passed: **149 passed, zero failures, zero skips**. The build-generated `next-env.d.ts` change was restored.
- MCP: lint, typecheck (`tsc --noEmit`), build and full tests with real-site integrations passed: **231 passed, one optional remote smoke skipped, zero failures** out of 232 tests.
- Additional authorized real GET route → strict wire schema → MCP SDK HTTP → strict output schema roundtrip passed. It exposes both exact saved-reference names, ten tools and no old cover metadata/resources. `list_blog_posts` and `get_blog_post` compatibility tests passed.
- Regressions cover required saved-reference names/absence instructions, identity-only pose variation, all five visual rejection conditions, review before presentation, strict schemas/legacy metadata filtering and clean removal of the old tool/resources. Existing 16:9, body/privacy, storage and publishing tests remain.
- Shared-source synchronization and whitespace checks passed. Upload/Drive-import, OAuth, CTA/conversion, article validators and publishing code remain unchanged; the editorial validator only renames the internal provenance registry.
- These tests verify instructions/contracts, not native generator behavior or availability of references inside a ChatGPT session. No production mutation, image generation, commit, push or deployment.

## Permanent CTA rule (unchanged)

The backend and MCP share `lib/blog/cta-policy.ts` / `src/cta-policy.ts`. Every CTA button label must contain **45–50 visible Unicode characters in the complete label**, including spaces and the exact final `" →"` (U+0020 space, U+2192 arrow). No character may follow the arrow. Example: `Automate missed calls and book more jobs today →` has 48 characters.

Count grapheme clusters using `Intl.Segmenter`, including combining accents and emoji as one visible character. The parser preserves the label exactly; trailing whitespace cannot be silently trimmed to make the suffix valid. Draft/legacy transport still allows up to 100 visible characters, so incomplete drafts can be saved and existing labels remain readable.

Each label must be unique within the post and directly related to its immediately preceding section. Existing duplicate normalization (Unicode, case, whitespace and punctuation) is retained. Context is explicit editorial guidance and requires human review.

`BLOG_TEMPLATE` v4 preserves `ctaButtonRules`; the legacy template remains v1. MCP `get_blog_template` exposes the same rules and `backendCtaRulesSupported`, including permanent generation guidance. For `editorial.policyVersion=1`, the following are **errors**, never merely warnings:

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
