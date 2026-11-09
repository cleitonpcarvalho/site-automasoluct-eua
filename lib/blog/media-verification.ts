import "server-only";
import { createHash } from "node:crypto";
import { officialCoverAssetIds } from "./cover-asset-metadata.ts";
import sharp from "sharp";
import { BlogError } from "./errors.ts";
import { isImagePlaceholder } from "./image-workflow.ts";
import type { BlogMedia } from "./media-types.ts";
import type { BlogImage } from "./types.ts";

type Reader = (filename: string) => Promise<{ bytes: Buffer }>;
// Only verifies existing uploaded bytes. No generation or replacement fallback.
export function createStoredImageVerifier(getMedia: (id: string) => BlogMedia, readImage: Reader) {
  return async (image: BlogImage, requireConfirmedUpload = false) => {
    let media: BlogMedia | undefined;
    try { media = getMedia(image.id); }
    catch (error) {
      if (!(error instanceof BlogError) || error.status !== 404) throw error;
      if (requireConfirmedUpload) throw new BlogError(422, "media_upload_unconfirmed", "The image has no persisted upload record. Stop and report an incomplete draft instead of using a simulated reference.");
    }
    if (requireConfirmedUpload && media && (media.id !== image.id || media.url !== image.url || media.type !== image.type || media.fileName !== image.url.split("/").at(-1))) throw new BlogError(422, "media_reference_mismatch", "Use exactly the image reference acknowledged by its uploaded media record.");
    const { bytes } = await readImage(image.url.slice("/uploads/blog/".length));
    // Preserve the established legacy filesystem references without opting old
    // records into a new upload registry requirement.
    if (!requireConfirmedUpload || !media) return media?.provenance;
    if (media.width <= 1 || media.height <= 1 || isImagePlaceholder(media.originalName) || isImagePlaceholder(media.alt)) throw new BlogError(422, "image_placeholder", "A placeholder or one-pixel stand-in cannot complete the article images. Obtain the actual image file.");
    if (image.type === "featured" && officialCoverAssetIds(createHash("sha256").update(bytes).digest("hex")).length > 0) throw new BlogError(422, "cover_source_asset", "The official portrait/logo is only a reference asset. Upload a newly composed cover generated in the ChatGPT conversation.");
    if (bytes.length !== media.size) throw new BlogError(422, "media_content_mismatch", "Stored image bytes do not match the confirmed upload metadata.");
    try {
      const decoded = sharp(bytes, { limitInputPixels: 24000000, failOn: "warning" });
      const metadata = await decoded.metadata();
      const format = { "image/png": "png", "image/jpeg": "jpeg", "image/webp": "webp" }[media.mimeType];
      if (metadata.format !== format || (metadata.autoOrient?.width ?? metadata.width) !== media.width || (metadata.autoOrient?.height ?? metadata.height) !== media.height || (metadata.pages ?? 1) > 1) throw new Error("Invalid stored image metadata");
      await decoded.raw().toBuffer();
    } catch { throw new BlogError(422, "media_content_mismatch", "The stored upload is not a complete decodable image matching its media record."); }
    return media.provenance;
  };
}
