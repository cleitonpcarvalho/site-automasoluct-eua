// Names are resolved by the ChatGPT image generator, never downloaded by the MCP.
// Keep this policy identical in the site and MCP repositories.
export const SAVED_COVER_REFERENCES = {
    source: 'chatgpt_saved_reference_images',
    founder: { name: 'Cleiton Carvalho', purpose: 'founder_identity', identityReferenceOnly: true },
    logo: { name: 'Automa Soluct', purpose: 'official_logo', preserveExactly: true },
} as const;
