// Canonical public sources. Keep this registry identical in the site and MCP.
export const DEFAULT_ASSETS = {
    default_cover_portrait: { id: 'default_cover_portrait', path: '/file/d/16E9m_oWHJxr54ST_NddqMYevefB9Zvn_/view', url: 'https://drive.google.com/file/d/16E9m_oWHJxr54ST_NddqMYevefB9Zvn_/view', sha256: '402a8a19611ca23af8916dac731cf1203da0389695b319a89545d78c85ac2d97', mimeType: 'image/png', usage: 'cover_only' },
    default_cover_logo: { id: 'default_cover_logo', path: '/file/d/1hrYGGW0M1h3PEQdFby3HuouIQPWNzwB7/view', url: 'https://drive.google.com/file/d/1hrYGGW0M1h3PEQdFby3HuouIQPWNzwB7/view', sha256: '8fe8c3315cd917bd1077e36bc6d67fce57aae8299c48d4010de819b8d8cc439d', mimeType: 'image/png', usage: 'cover_only' },
} as const;

// Recognition only: never a download source or a delivery fallback. Existing
// portrait references must remain detectable after the canonical PNG changes.
export function officialCoverAssetIds(sha256: string) {
    return Object.values(DEFAULT_ASSETS).filter(asset => asset.sha256 === sha256 ||
        (asset.id === 'default_cover_portrait' && sha256 === 'ca591ab564082f74572ec0885f5582e59632eeca20e5c900ba5ed3e54fb24871')).map(asset => asset.id);
}
