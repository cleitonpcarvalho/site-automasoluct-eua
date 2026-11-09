import "server-only";

import { getAdminAuth, getAdminConfig } from "./admin/auth.ts";
import { adminJson } from "./admin/handlers.ts";
import { blogUploadLimits } from "./config.ts";
import { BlogError, invalid } from "./errors.ts";
import { readBlogJson } from "./http.ts";
import { getMediaService, parseMediaQuery, type MediaService, type StoreBlogImageInput } from "./media-service.ts";
import { parseProvenance, record } from "./validation.ts";

async function readUpload(request: Request): Promise<StoreBlogImageInput> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^multipart\/form-data\s*;/i.test(contentType)) throw new BlogError(415, "unsupported_media_type", "Use multipart/form-data com file, alt e type.");
  const maxBytes = blogUploadLimits().maxBytes;
  const maxRequest = maxBytes + 64 * 1024;
  const length = request.headers.get("content-length");
  if (length && (!/^[0-9]+$/.test(length) || Number(length) > maxRequest)) throw new BlogError(413, "image_too_large", "O envio excede o limite de upload.");
  const reader = request.body?.getReader();
  if (!reader) return invalid("Selecione um arquivo para enviar.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxRequest) { await reader.cancel(); throw new BlogError(413, "image_too_large", "O envio excede o limite de upload."); }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  let form: FormData;
  try { form = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": contentType } }).formData(); }
  catch { return invalid("O envio multipart está inválido."); }
  if ([...form.keys()].some(key => !["file", "alt", "type", "provenance"].includes(key) || form.getAll(key).length !== 1)) return invalid("Campos de upload inválidos ou duplicados.");
  const file = form.get("file");
  if (!(file instanceof File)) return invalid("Selecione um arquivo de imagem.");
  if (file.size > maxBytes) throw new BlogError(413, "image_too_large", "A imagem excede o limite de upload.");
  let provenance;
  if (form.has("provenance")) {
    try { provenance = parseProvenance(JSON.parse(String(form.get("provenance")))); }
    catch { return invalid("Procedência de imagem inválida."); }
  }
  return { ...(provenance ? { provenance } : {}), bytes: new Uint8Array(await file.arrayBuffer()), mimeType: file.type, originalName: file.name, alt: form.get("alt") as string, type: form.get("type") as StoreBlogImageInput["type"] };
}

type AuthorizeMedia = (request: Request, write: boolean) => void;
const authorizeAdmin: AuthorizeMedia = (request, write) => { getAdminAuth(getAdminConfig()).require(request, write); };
const uploads = globalThis as typeof globalThis & { blogMediaUploads?: number };

export function createMediaHandlers(resolveService: () => MediaService = getMediaService, authorize: AuthorizeMedia = authorizeAdmin) {
  async function execute(request: Request, write: boolean, action: (service: MediaService) => Response | Promise<Response>) {
    try {
      authorize(request, write); // Authenticate/CSRF before storage or body reads.
      return await action(resolveService());
    } catch (error) {
      if (error instanceof BlogError) return adminJson({ error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } }, error.status, error.status === 429 ? { "Retry-After": "2" } : undefined);
      console.error("Blog media operation failed.", error instanceof Error ? error.name : "UnknownError");
      return adminJson({ error: { code: "media_operation_failed", message: "Não foi possível concluir a operação de mídia." } }, 500);
    }
  }
  async function body(request: Request, key: string) {
    const value = record(await readBlogJson(request), "media");
    if (Object.keys(value).some(item => item !== key)) return invalid("Campo de mídia desconhecido.");
    return value[key];
  }
  return {
    list: (request: Request) => execute(request, false, service => adminJson({ data: service.list(parseMediaQuery(new URL(request.url).searchParams)) })),
    get: (request: Request, id: string) => execute(request, false, service => adminJson({ data: service.get(id) })),
    upload: (request: Request) => execute(request, true, async service => {
      if ((uploads.blogMediaUploads ?? 0) >= 2) throw new BlogError(429, "image_processing_busy", "Aguarde os outros envios e tente novamente.");
      uploads.blogMediaUploads = (uploads.blogMediaUploads ?? 0) + 1;
      try { return adminJson({ data: await service.storeBlogImage(await readUpload(request)) }, 201); }
      finally { uploads.blogMediaUploads!--; }
    }),
    update: (request: Request, id: string) => execute(request, true, async service => adminJson({ data: service.updateAlt(id, await body(request, "alt")) })),
    remove: (request: Request, id: string) => execute(request, true, async service => { await service.remove(id, await body(request, "confirmation")); return adminJson({ data: { deleted: true } }); }),
  };
}
