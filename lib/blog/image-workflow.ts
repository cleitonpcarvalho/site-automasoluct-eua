import type { BlogPost } from './types.ts';
import { FEATURED_IMAGE_REVIEW_INSTRUCTION, IMAGE_GENERATION_INSTRUCTIONS } from './image-generation-guidance.ts';

export { FEATURED_IMAGE_GENERATION_INSTRUCTION, BODY_IMAGE_GENERATION_INSTRUCTION } from './image-generation-guidance.ts';

// Guidance describes the ChatGPT host. This module never calls a generator.
export const IMAGE_WORKFLOW_POLICY = {
    version: 1,
    generationLocation: 'chatgpt_conversation',
    mcpGeneratesImages: false,
    requiredFeaturedImages: 1,
    requiredBodyImages: 4,
    featuredImage: {
        postGenerationVisualInspectionRequired: true, rejectAndRegenerateFailedCover: true,
    },
    instructions: [
        'Image generation happens in the ChatGPT conversation, not inside the MCP. The MCP only uploads and associates real image files.',
        'If image generation is unavailable in the current ChatGPT session, stop the image workflow and report it instead of proceeding with fake or missing image references.',
        'Check the native image generation tool actually available in this ChatGPT session. Its absence from this MCP tools/list is expected and does not establish that native image generation is unavailable.',
        'Never use an OpenAI API key, call an image generation API, or add backend generation as a fallback.',
        ...IMAGE_GENERATION_INSTRUCTIONS,
        'Only call upload_blog_image after the real files are accessible through host-provided file params or their actual bytes. A prompt, file id alone, sandbox path, invented URL or tiny stand-in is not an image upload.',
        'Use exactly the reference objects acknowledged by successful uploads in featuredImage and blocks[].image. Never fabricate ids, references or an uploadConfirmed flag.',
        'Reread the saved draft, confirm 5/5 distinct image associations, then validate their registered media and stored files. Only a valid, complete result permits preview.',
        'If generation is unavailable or files cannot be accessed, stop the image workflow. Clearly report the reason and INCOMPLETE_DRAFT with the actual associated count; never claim upload, preview readiness or publication success.',
    ],
};
export const IMAGE_WORKFLOW_STEPS = [
    'get_blog_template; check native image generation availability in this ChatGPT conversation',
    'create_blog_draft with article content; explicitly report partial drafts as incomplete',
    'ChatGPT native tool generates 1 featured file in exactly 16:9, landscape only, with a professional editorial composition appropriate to the article, and obtains 4 real body files; generate every body image in exactly 16:9, landscape only, as one standalone image in a separate native image-generation operation, waiting for each result; prioritize faithful user-supplied screenshots and inspect/redact sensitive data before any use; use useful clean diagrams second and related realistic editorial images third. For the featured cover only, adapt any visible pose, expression, head/body angles, hand position, framing, placement and composition for the article context',
    FEATURED_IMAGE_REVIEW_INSTRUCTION,
    'Only after all 5 real files are accessible, upload_blog_image once per file; require successful uploadConfirmed responses',
    'Use exactly the reference objects returned by those uploads',
    'update_blog_post: associate featuredImage and the four blocks[].image objects',
    'get_blog_post: reread the saved revision',
    'Confirm 5/5 distinct saved image associations; an association count alone is not storage verification',
    'validate_blog_post: require valid=true and imageStatus.complete=true with 5/5 verified images',
    'preview_blog_post of the validated revision',
    'publish_blog_post only after explicit user intent',
];

export type ImageSessionContext = { imageGenerationAvailable?: boolean | undefined; imageFilesAccessible?: boolean | undefined };
export function imageSessionGuidance(context: ImageSessionContext = {}) {
    const stop = context.imageGenerationAvailable === false || context.imageFilesAccessible === false;
    return { ...IMAGE_WORKFLOW_POLICY,
        sessionAvailabilityIsClientReported: true,
        reportedImageGenerationAvailable: context.imageGenerationAvailable ?? null,
        reportedImageFilesAccessible: context.imageFilesAccessible ?? null,
        action: stop ? 'stop' : context.imageGenerationAvailable === undefined ? 'check_native_session_tool' : 'obtain_real_files_then_upload',
        draftMustBeReportedIncomplete: stop,
        completionRequiresVerifiedImages: true,
        message: context.imageGenerationAvailable === false ? 'Native image generation is unavailable in this ChatGPT session. Stop the image workflow and report INCOMPLETE_DRAFT; do not fabricate images or references.' : context.imageFilesAccessible === false ? 'The real image files are not accessible. Stop the image workflow and report INCOMPLETE_DRAFT; an image visible in chat is not proof that the MCP can download its file.' : 'Check the native tool and real files in this session. The MCP cannot detect or enable ChatGPT image generation. No completion may be claimed before upload, reread and verification.',
    };
}
export function isImagePlaceholder(text: string): boolean {
    return /\b(?:placeholder|image pending|imagem pendente|capa pendente|fake image|dummy image|mock image|simulated image|imagem simulada)\b/i.test(text) || /^\s*(?:TODO|TBD|a gerar)\s*$/i.test(text);
}
export function postImageReferences(post: BlogPost) {
    return [
        ...(post.featuredImage ? [{ image: post.featuredImage, field: 'featuredImage', caption: undefined }] : []),
        ...post.blocks.flatMap((block, index) => block.type === 'image' && block.image ? [{ image: block.image, field: `blocks.${index}.image`, caption: block.caption }] : []),
    ];
}
export function imageAssociationStatus(post: BlogPost, verifiedFields: readonly string[] = []) {
    const references = postImageReferences(post);
    const bodyBlocks = post.blocks.filter(block => block.type === 'image');
    const associatedBody = bodyBlocks.filter(block => block.image).length;
    const missingFields = [
        ...(!post.featuredImage ? ['featuredImage'] : []),
        ...post.blocks.flatMap((block, i) => block.type === 'image' && !block.image ? [`blocks.${i}.image`] : []),
        ...(bodyBlocks.length < 4 ? ['blocks (4 body-image slots required)'] : []),
    ];
    const placeholderFields = references.filter(({ image, caption }) => isImagePlaceholder(image.alt) || (caption ? isImagePlaceholder(caption) : false)).map(({ field }) => field);
    const verified = references.filter(({ field }) => verifiedFields.includes(field) && !placeholderFields.includes(field)).map(({ field }) => field);
    const associated = references.length;
    const unique = new Set(references.map(({ image }) => image.id)).size;
    const complete = !!post.featuredImage && bodyBlocks.length === 4 && missingFields.length === 0 && associatedBody === 4 && associated === 5 && unique === 5 && verified.length === 5 && !placeholderFields.length;
    return { expected: 5 as const, associated, verified: verified.length, verifiedFields: verified, missingFields, placeholderFields, complete,
        state: complete ? 'complete' as const : missingFields.length || placeholderFields.length || associated !== 5 || unique !== 5 ? 'incomplete' as const : 'awaiting_verification' as const };
}
