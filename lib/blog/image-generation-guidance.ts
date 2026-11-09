// Keep this instruction-only module identical in the site and MCP repositories.
// It does not generate, edit, inspect, upload or validate image files.
export const FEATURED_IMAGE_GENERATION_INSTRUCTION = [
    'Featured image: REQUIRED aspect ratio exactly 16:9, landscape only. Explicitly request 16:9 in the native image-generation operation. Never 1:1, never 4:3, never portrait orientation, never 9:16.',
    'Use the ChatGPT Saved Reference Images named exactly "Cleiton Carvalho" as the founder identity reference and "Automa Soluct" as the official logo reference. Select both saved references in the ChatGPT image generator. If either saved reference is unavailable to the ChatGPT image generator, DO NOT generate the featured image: report that the required saved reference is unavailable, naming the missing reference. Never invent or substitute a person or logo. Do not replace a missing saved reference with a downloaded file, URL or MCP image block.',
    'The "Cleiton Carvalho" saved image is an IDENTITY REFERENCE ONLY: preserve the exact facial identity, recognizable facial features, beard, hair and person identity. Preserve the official Automa Soluct logo exactly using its saved reference. Do NOT copy the reference pose. The original saved reference has crossed arms; it is not a pose or composition template. Do not upload a source reference as the finished cover.',
    'Adapt pose, facial expression, head angle, body angle, hand position, camera framing, subject placement and composition naturally to the article context. Analytical/technical: focused, confident, thoughtful. Growth/opportunity: positive, energetic, confident. Warning/problem: serious, attentive, concerned. Educational: approachable and professional. Automation/operations: decisive, engaged, professional.',
    'Avoid repetitive covers across posts. Do not repeatedly reproduce crossed arms, a straight-on passport/headshot pose, the same body posture, the same neutral facial expression, the same crop or the same subject placement. Keep expressions and gestures realistic and professional. No exaggerated gestures, no caricature, no theatrical expressions, no unnatural body positions. This pose/expression variation rule applies ONLY to the featured image.',
].join(' ');

export const FEATURED_IMAGE_REVIEW_INSTRUCTION = [
    'Featured image post-generation check: Before presenting the featured image to the user, visually inspect the result against the saved references and article context.',
    'Reject and regenerate it if the person does not match Cleiton Carvalho, the logo does not match Automa Soluct, the result simply copies the original crossed-arms pose, the pose/expression does not fit the article context, or the logo was invented, distorted or substituted.',
    'Use the correct saved references again and visually inspect every regenerated result. Do not present a failed generation as a valid cover. If a required saved reference is unavailable, stop and report the missing reference instead of regenerating with an invented substitute.',
].join(' ');

export const BODY_IMAGE_GENERATION_INSTRUCTION = [
    'For ALL four body images: REQUIRED aspect ratio exactly 16:9, landscape only. Explicitly request 16:9 in every native image-generation operation. Never 1:1, never 4:3, never portrait orientation, never 9:16.',
    'Generate each as one standalone image in a separate native image-generation operation. Wait for each result before generating the next body image. Each image must directly support its article section and look like a natural editorial/supporting visual placed inside an article. Body images are NOT thumbnails.',
    'No headline, no title, no subtitle, no CTA, no text overlays, no large typography, no logo, no Automa Soluct logo, no Automa Soluct branding, no portrait of the founder, no social-media-thumbnail composition, no article cover composition. No collage, no multi-panel layout, no article mockup, no screenshot montage. No pixel art, no invented retro terminal styling, no crude infographic.',
    'Text may appear only when inherently part of a real UI/system screenshot supplied by the user. Do NOT invent decorative text inside generated images. Do not pass the cover portrait/logo as body-generation references. These body-image restrictions do not apply to the featured cover.',
].join(' ');

export const SCREENSHOT_IMAGE_GENERATION_INSTRUCTION = [
    'User-supplied screenshots: PRIORITIZE the real screenshot instead of recreating or heavily stylizing it when it directly supports the section. This includes software systems, dashboards, Jobber, n8n workflows, CRM, automation flows, spreadsheets, browser interfaces, app UI, terminals and similar operational material.',
    'Keep the screenshot recognizable and faithful to the original. Allowed treatment is subtle only: clean dark background, minimal frame/browser/device-style border, slight spacing/crop improvements, subtle shadow, breathing room, slight zoom/crop to emphasize one relevant section, or subtle perspective only when it does not distort readability. Use an exactly 16:9 landscape canvas with padding rather than stretching or distorting the UI.',
    'Do NOT turn it into a collage or thumbnail, add excessive graphical elements, add arrows everywhere, add colorful decorations, add fake dashboards, redraw the UI, invent extra interface elements, alter visible data except for required sensitive-data redaction, cover the interface with large text, or make it visually noisy. Do not invent retro-terminal styling; preserve real user-supplied terminal screenshots. Present the REAL screenshot as a polished editorial visual, never a redesigned or fictionalized interface.',
].join(' ');

export const SCREENSHOT_REDACTION_INSTRUCTION = [
    'Screenshot privacy: Before using ANY user-supplied screenshot, inspect it for potentially sensitive/private information. If sensitive data is visible, blur/redact it BEFORE passing the screenshot to native generation, upload or any article use.',
    'Inspect email addresses, phone numbers, customer names, client addresses, API keys, tokens, passwords, secret keys, credentials, account IDs, invoice/customer identifiers, personal financial information, private URLs containing tokens or credentials, and any other private customer/company information.',
    'Redaction must be strong enough that the original sensitive value cannot be read or recovered from the delivered image, visually clean, and preserve the useful surrounding UI/context. Use opaque redaction or sufficiently strong flattened blur. Never fabricate replacement sensitive values. Do NOT unnecessarily blur generic/public product UI labels, public company names or non-sensitive interface elements. Preserve all other visible data faithfully.',
].join(' ');

export const BODY_IMAGE_SELECTION_INSTRUCTION = [
    'Body image selection priority for each article section: 1. A user-supplied screenshot that directly supports the section. 2. A clean diagram/system visualization when genuinely useful. 3. A realistic editorial image directly related to the section.',
    'Do not force screenshots into unrelated sections. Do not force diagrams when a realistic image is more appropriate. Keep exactly 1 featured image and exactly 4 body images; use exactly 16:9 for every final image.',
].join(' ');

export const IMAGE_GENERATION_INSTRUCTIONS = [
    FEATURED_IMAGE_GENERATION_INSTRUCTION,
    FEATURED_IMAGE_REVIEW_INSTRUCTION,
    BODY_IMAGE_GENERATION_INSTRUCTION,
    SCREENSHOT_IMAGE_GENERATION_INSTRUCTION,
    SCREENSHOT_REDACTION_INSTRUCTION,
    BODY_IMAGE_SELECTION_INSTRUCTION,
];
