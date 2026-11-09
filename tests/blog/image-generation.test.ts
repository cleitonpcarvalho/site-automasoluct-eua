import assert from "node:assert/strict";
import { test } from "node:test";
import { CTA_BUTTON_RULES } from "../../lib/blog/cta-policy.ts";
import { BLOG_CONVERSION_RULES } from "../../lib/blog/conversion.ts";
import { EDITORIAL_GUIDANCE } from "../../lib/blog/editorial-policy.ts";
import { blogJson } from "../../lib/blog/http.ts";
import { IMAGE_WORKFLOW_POLICY, IMAGE_WORKFLOW_STEPS } from "../../lib/blog/image-workflow.ts";
import { BLOG_TEMPLATE, LEGACY_BLOG_TEMPLATE } from "../../lib/blog/template.ts";

function requiredRatio(text: string) {
  assert.match(text, /REQUIRED aspect ratio exactly 16:9/);
  assert.match(text, /landscape only/);
  for (const forbidden of ["1:1", "4:3", "portrait orientation", "9:16"]) {
    assert.ok(text.toLowerCase().includes(`never ${forbidden}`), `Missing explicit ban: ${forbidden}`);
  }
  assert.doesNotMatch(text, /approximately|roughly|about 16:9/i);
}

test("template HTTP payload requires exactly 16:9 for the featured cover and all four body slots", async () => {
  const response = blogJson({ data: BLOG_TEMPLATE });
  assert.equal(response.status, 200);
  const { data } = await response.json() as { data: typeof BLOG_TEMPLATE };
  // Keep the existing HTTP contract: generation instructions live in purpose strings.
  assert.deepEqual(Object.keys(data).sort(), ["id", "version", "approval", "fieldsOutsideSequence", "requirements", "slots", "imageWorkflowVersion", "editorialPolicyVersion", "ctaButtonRules", "conversionRules", "defaultAssets"].sort());
  const images = data.slots.filter(slot => slot.type === "image");
  assert.equal(images.length, 4);
  assert.deepEqual(images.map(slot => slot.id), ["image-1", "image-2", "image-3", "image-4"]);
  requiredRatio(images[0].purpose.slice(images[0].purpose.indexOf("Featured image:")));
  for (const slot of images) {
    const body = slot.purpose.slice(slot.purpose.indexOf("For ALL four body images:"));
    requiredRatio(body);
    assert.match(body, /one standalone image/);
    assert.match(body, /separate native image-generation operation/);
    assert.match(body, /Wait for each result/);
    for (const prohibited of ["no collage", "no multi-panel layout", "no article mockup", "no headline", "no title", "no subtitle", "no cta", "no text overlays", "no logo", "no portrait of the founder", "no social-media-thumbnail composition", "no article cover composition"]) {
      assert.ok(body.toLowerCase().includes(prohibited));
    }
  }
  assert.equal(data.version, 4);
  assert.equal(data.imageWorkflowVersion, 1);
  assert.equal(data.requirements.internalImages, 4);
  assert.equal(data.slots.length, 26);
  assert.deepEqual(data.slots.map(slot => [slot.id, slot.type, slot.level]), LEGACY_BLOG_TEMPLATE.slots.map(slot => [slot.id, slot.type, slot.level]));
  assert.deepEqual(data.ctaButtonRules, CTA_BUTTON_RULES);
  assert.deepEqual(data.conversionRules, BLOG_CONVERSION_RULES);
  assert.equal(LEGACY_BLOG_TEMPLATE.version, 1);
  assert.equal(LEGACY_BLOG_TEMPLATE.slots.find(slot => slot.id === "image-1")!.purpose, "5. Imagem 1");
});

test("featured and body workflow instructions explicitly require 16:9 in each native generation request", () => {
  const featured = IMAGE_WORKFLOW_POLICY.instructions.find(text => text.startsWith("Featured image:"));
  const body = IMAGE_WORKFLOW_POLICY.instructions.find(text => text.startsWith("For ALL four body images:"));
  assert.ok(featured); assert.ok(body);
  requiredRatio(featured); requiredRatio(body);
  assert.match(featured, /Explicitly request 16:9/);
  assert.match(featured, /default_cover_portrait and default_cover_logo/);
  assert.match(body, /Explicitly request 16:9 in every native image-generation operation/);
  assert.match(body, /separate native image-generation operation/);
  assert.match(body, /one standalone image/);
  assert.equal(IMAGE_WORKFLOW_POLICY.requiredFeaturedImages, 1);
  assert.equal(IMAGE_WORKFLOW_POLICY.requiredBodyImages, 4);
});

test("editorial image guidance and the generation workflow repeat the mandatory ratio", () => {
  assert.match(EDITORIAL_GUIDANCE.images[0], /featured image.*4 body images.*16:9.*obrigat/);
  assert.match(EDITORIAL_GUIDANCE.images[3], /16:9.*operação nativa separada/);
  const generation = IMAGE_WORKFLOW_STEPS.find(step => step.startsWith("ChatGPT native tool generates"));
  assert.ok(generation);
  assert.match(generation, /featured.*exactly 16:9/);
  assert.match(generation, /body.*exactly 16:9/);
  assert.match(generation, /separate native image-generation operation/);
});


function rule(prefix: string) {
  const instruction = IMAGE_WORKFLOW_POLICY.instructions.find(text => text.startsWith(prefix));
  assert.ok(instruction, `Missing permanent instruction: ${prefix}`);
  return instruction;
}

test("featured portrait is an identity-only reference with contextual, professional variation", () => {
  const featured = rule("Featured image:");
  assert.match(featured, /IDENTITY reference only/);
  assert.match(featured, /preserve the exact person, recognizable facial features and facial identity/);
  assert.match(featured, /Preserve the official Automa Soluct logo exactly/);
  assert.match(featured, /Do NOT simply reproduce the reference pose/);
  for (const variation of ["pose", "facial expression", "head/body angle", "camera framing", "subject placement", "composition"]) assert.ok(featured.includes(variation));
  for (const context of ["Analytical/technical", "Growth/opportunity", "Warning/problem", "Educational", "Automation/operations"]) assert.ok(featured.includes(context));
  for (const repeated of ["crossed arms", "straight-on headshot", "same neutral expression", "same subject position", "same crop"]) assert.ok(featured.includes(repeated));
  for (const prohibited of ["exaggerated gestures", "caricature", "theatrical expressions", "unnatural body positions"]) assert.ok(featured.toLowerCase().includes(`no ${prohibited}`));
  assert.match(featured, /ONLY to the featured image/);
  assert.ok(!rule("For ALL four body images:").includes("crossed arms"));
});

test("body visuals never become thumbnails and screenshots stay real with subtle treatment only", () => {
  const body = rule("For ALL four body images:");
  assert.match(body, /Body images are NOT thumbnails/);
  assert.match(body, /Text may appear only when inherently part of a real UI\/system screenshot supplied by the user/);
  assert.match(body, /Do NOT invent decorative text/);
  assert.doesNotMatch(body, /unless explicitly requested/);
  const screenshot = rule("User-supplied screenshots:");
  assert.match(screenshot, /PRIORITIZE the real screenshot instead of recreating or heavily stylizing it/);
  for (const source of ["Jobber", "n8n", "CRM", "spreadsheets", "browser interfaces", "app UI", "terminals"]) assert.ok(screenshot.includes(source));
  for (const treatment of ["clean dark background", "minimal frame", "subtle shadow", "breathing room", "slight zoom/crop", "does not distort readability", "padding rather than stretching"]) assert.ok(screenshot.includes(treatment));
  for (const prohibited of ["collage or thumbnail", "excessive graphical elements", "arrows everywhere", "colorful decorations", "fake dashboards", "redraw the UI", "invent extra interface elements", "alter visible data except for required sensitive-data redaction", "large text", "visually noisy"]) assert.ok(screenshot.includes(prohibited));
});

test("screenshot privacy requires effective redaction before use and preserves public UI", () => {
  const privacy = rule("Screenshot privacy:");
  assert.match(privacy, /Before using ANY user-supplied screenshot, inspect/);
  assert.match(privacy, /BEFORE passing the screenshot to native generation, upload or any article use/);
  for (const sensitive of ["email addresses", "phone numbers", "customer names", "client addresses", "API keys", "tokens", "passwords", "secret keys", "credentials", "account IDs", "invoice/customer identifiers", "personal financial information", "private URLs", "private customer/company information"]) assert.ok(privacy.includes(sensitive));
  assert.match(privacy, /cannot be read or recovered/);
  assert.match(privacy, /preserve the useful surrounding UI\/context/);
  assert.match(privacy, /Never fabricate replacement sensitive values/);
  assert.match(privacy, /Do NOT unnecessarily blur generic\/public product UI labels, public company names or non-sensitive interface elements/);
});

test("authoritative HTTP template and editorial guidance expose all rules and the section-specific priority", async () => {
  const { data } = await blogJson({ data: BLOG_TEMPLATE }).json() as { data: typeof BLOG_TEMPLATE };
  const firstImage = data.slots.find(slot => slot.id === "image-1")!;
  for (const marker of ["Featured image:", "For ALL four body images:", "User-supplied screenshots:", "Screenshot privacy:", "Body image selection priority"]) {
    const instruction = rule(marker);
    assert.ok(firstImage.purpose.includes(instruction));
    assert.ok(EDITORIAL_GUIDANCE.images.includes(instruction));
  }
  const priority = rule("Body image selection priority");
  assert.match(priority, /1\. A user-supplied screenshot.*2\. A clean diagram\/system visualization.*3\. A realistic editorial image/);
  assert.match(priority, /Do not force screenshots into unrelated sections/);
  assert.match(priority, /Do not force diagrams when a realistic image is more appropriate/);
});
