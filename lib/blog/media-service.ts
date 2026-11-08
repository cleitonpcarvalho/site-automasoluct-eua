import "server-only";

import { randomUUID } from "node:crypto";
import { unlinkSync } from "node:fs";
import { mkdir, open, realpath, unlink } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

import { blogPaths, blogUploadLimits, BLOG_UPLOAD_URL } from "./config.ts";
import { getBlogDatabase } from "./database.ts";
import { BlogError, invalid } from "./errors.ts";
import { createMediaRepository, type MediaRepository } from "./media-repository.ts";
import type { BlogMedia, BlogMediaType, MediaQuery } from "./media-types.ts";
import { BLOG_IMAGE_FILENAME } from "./validation.ts";

export type StoreBlogImageInput = { bytes: Uint8Array; mimeType: string; alt: string; type: BlogMediaType; originalName?: string };
const formats = { "image/png": "png", "image/jpeg": "jpeg", "image/webp": "webp" } as const;
const decodeState = globalThis as typeof globalThis & { blogMediaDecoding?: boolean };
export function parseMediaId(id: string) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)) return invalid("Identificador de mídia inválido.");
  return id;
}
export function parseMediaAlt(value: unknown): string {
  if (typeof value !== "string" || value.length > 300 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) return invalid("O texto alternativo deve ter até 300 caracteres.");
  return value.trim();
}
export function parseMediaQuery(search: URLSearchParams): MediaQuery {
  if ([...search.keys()].some(key => !["q", "page", "pageSize"].includes(key) || search.getAll(key).length !== 1)) return invalid("Parâmetro de busca inválido.");
  const query = search.get("q")?.trim() ?? "";
  if (query.length > 160) return invalid("Use até 160 caracteres na busca.");
  function number(key: string, fallback: number, max: number) {
    const value = search.get(key);
    if (value === null) return fallback;
    if (!/^[1-9][0-9]*$/.test(value) || Number(value) > max) return invalid("Paginação de mídia inválida.");
    return Number(value);
  }
  return { page: number("page", 1, 10000), pageSize: number("pageSize", 12, 48), search: query };
}

function signature(bytes: Buffer, mime: string) {
  if (mime === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
}

export function createMediaService(repository: MediaRepository, directory = blogPaths().uploads, limits = blogUploadLimits()) {
  return {
    list(query: MediaQuery) { return repository.list(parseMediaQuery(new URLSearchParams({ page: String(query.page), pageSize: String(query.pageSize), q: query.search ?? "" }))); },
    get(id: string) { const media = repository.get(parseMediaId(id)); return { ...media, usedBy: repository.uses(media) }; },
    updateAlt(id: string, alt: unknown) { return repository.updateAlt(parseMediaId(id), parseMediaAlt(alt)); },
    async storeBlogImage(input: StoreBlogImageInput): Promise<BlogMedia> {
      const alt = parseMediaAlt(input.alt);
      if (!["featured", "internal", "other"].includes(input.type)) return invalid("Uso da imagem inválido.");
      if (!Object.hasOwn(formats, input.mimeType)) throw new BlogError(415, "unsupported_image_type", "Envie somente PNG, JPEG ou WebP. SVG não é permitido.");
      if (!(input.bytes instanceof Uint8Array) || input.bytes.byteLength === 0) return invalid("Selecione uma imagem não vazia.");
      if (input.bytes.byteLength > limits.maxBytes) throw new BlogError(413, "image_too_large", "A imagem excede o limite de upload configurado.");
      if (input.originalName !== undefined && (typeof input.originalName !== "string" || input.originalName.length > 1024)) return invalid("Nome de imagem inválido.");
      const bytes = Buffer.from(input.bytes);
      if (!signature(bytes, input.mimeType)) throw new BlogError(415, "image_type_mismatch", "O conteúdo da imagem não corresponde ao MIME informado.");
      if (decodeState.blogMediaDecoding) throw new BlogError(429, "image_processing_busy", "Aguarde o processamento da outra imagem e tente novamente.");
      decodeState.blogMediaDecoding = true;
      let width: number, height: number;
      try {
        const image = sharp(bytes, { limitInputPixels: limits.maxPixels, failOn: "warning" });
        const metadata = await image.metadata();
        if (metadata.format !== formats[input.mimeType as keyof typeof formats] || !metadata.width || !metadata.height || (metadata.pages ?? 1) > 1) throw new Error("unsupported");
        if (metadata.width > limits.maxDimension || metadata.height > limits.maxDimension || metadata.width * metadata.height > limits.maxPixels) throw new Error("dimensions");
        // A matching signature/header is insufficient: decode the entire image.
        // The original bytes are stored unchanged; no lossy conversion occurs.
        await image.raw().toBuffer();
        width = metadata.autoOrient?.width ?? metadata.width;
        height = metadata.autoOrient?.height ?? metadata.height;
      } catch { throw new BlogError(422, "invalid_image", "Imagem inválida, corrompida, animada ou com dimensões excessivas (máximo 24 MP / 12000 px por lado)."); }
      finally { decodeState.blogMediaDecoding = false; }
      const id = randomUUID();
      const extension = input.mimeType === "image/jpeg" ? "jpg" : formats[input.mimeType as keyof typeof formats];
      const fileName = `${id}.${extension}`;
      await mkdir(directory, { recursive: true, mode: 0o750 });
      const root = await realpath(directory);
      const target = join(root, fileName);
      const file = await open(target, "wx", 0o640);
      try { await file.writeFile(bytes); await file.sync(); }
      catch (error) { await file.close(); await unlink(target).catch(() => {}); throw error; }
      await file.close();
      try {
        return repository.create({ id, fileName, originalName: (input.originalName ?? "").split(/[\\/]/).at(-1)!.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 180) || fileName,
          url: `${BLOG_UPLOAD_URL}${fileName}`, alt, type: input.type, mimeType: input.mimeType as BlogMedia["mimeType"], size: bytes.byteLength, width, height, createdAt: new Date().toISOString() });
      } catch (error) { await unlink(target).catch(() => {}); throw error; }
    },
    async remove(id: string, confirmation: unknown) {
      parseMediaId(id);
      if (typeof confirmation !== "string") return invalid("Confirme a imagem a excluir.");
      const root = await realpath(directory).catch((error: NodeJS.ErrnoException) => { if (error.code === "ENOENT") return null; throw error; });
      repository.remove(id, confirmation, media => {
        if (!BLOG_IMAGE_FILENAME.test(media.fileName)) throw new BlogError(500, "invalid_storage_reference", "Referência de armazenamento inválida.");
        if (root) try { unlinkSync(join(root, media.fileName)); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
      });
    },
  };
}
export type MediaService = ReturnType<typeof createMediaService>;
export function getMediaService() { return createMediaService(createMediaRepository(getBlogDatabase())); }
export function storeBlogImage(input: StoreBlogImageInput) { return getMediaService().storeBlogImage(input); }
