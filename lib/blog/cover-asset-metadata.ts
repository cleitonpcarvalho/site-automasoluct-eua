// Historical provenance/validation identifiers only. No downloadable references.
// Keep recognition of existing source files without exposing them as guidance.
const historicalSources = [
    { id: 'default_cover_portrait' as const, sha256: '402a8a19611ca23af8916dac731cf1203da0389695b319a89545d78c85ac2d97' },
    { id: 'default_cover_portrait' as const, sha256: 'ca591ab564082f74572ec0885f5582e59632eeca20e5c900ba5ed3e54fb24871' },
    { id: 'default_cover_logo' as const, sha256: '8fe8c3315cd917bd1077e36bc6d67fce57aae8299c48d4010de819b8d8cc439d' },
];
export function officialCoverAssetIds(sha256: string) {
    return historicalSources.filter(asset => asset.sha256 === sha256).map(asset => asset.id);
}
