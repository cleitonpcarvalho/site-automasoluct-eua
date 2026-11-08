import "server-only";

import type { DatabaseSync, SQLOutputValue } from "node:sqlite";

import { BlogError } from "./errors.ts";
import type { BlogMedia, MediaPage, MediaQuery, MediaUse } from "./media-types.ts";

function decode(row: Record<string, SQLOutputValue>): BlogMedia {
  return {
    id: String(row.id), fileName: String(row.file_name), originalName: String(row.original_name), url: String(row.url),
    alt: String(row.alt), type: row.type as BlogMedia["type"], mimeType: row.mime_type as BlogMedia["mimeType"],
    size: Number(row.size), width: Number(row.width), height: Number(row.height), createdAt: String(row.created_at),
  };
}

export function createMediaRepository(database: DatabaseSync) {
  function get(id: string): BlogMedia {
    const row = database.prepare("SELECT * FROM blog_media WHERE id = ? AND deleted_at IS NULL").get(id);
    if (!row) throw new BlogError(404, "media_not_found", "Imagem não encontrada.");
    return decode(row);
  }
  function uses(media: BlogMedia): MediaUse[] {
    return database.prepare(`SELECT id, title, status FROM blog_posts p WHERE
      json_extract(p.featured_image, '$.id') = ? OR json_extract(p.featured_image, '$.url') = ? OR
      EXISTS (SELECT 1 FROM json_each(p.blocks) b WHERE json_extract(b.value, '$.type') = 'image' AND
        (json_extract(b.value, '$.image.id') = ? OR json_extract(b.value, '$.image.url') = ?))
      ORDER BY p.updated_at DESC`).all(media.id, media.url, media.id, media.url).map(row => ({ id: String(row.id), title: String(row.title), status: row.status as MediaUse["status"] }));
  }
  return {
    get, uses,
    create(media: BlogMedia) {
      database.prepare(`INSERT INTO blog_media
        (id, file_name, original_name, url, alt, type, mime_type, size, width, height, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(media.id, media.fileName, media.originalName, media.url, media.alt, media.type, media.mimeType, media.size, media.width, media.height, media.createdAt);
      return get(media.id);
    },
    list(query: MediaQuery): MediaPage {
      const pattern = `%${(query.search ?? "").replace(/[\\%_]/g, "\\$&")}%`;
      const where = "deleted_at IS NULL AND (file_name LIKE ? ESCAPE '\\' OR original_name LIKE ? ESCAPE '\\' OR alt LIKE ? ESCAPE '\\')";
      const args = [pattern, pattern, pattern];
      const total = Number(database.prepare(`SELECT count(*) AS total FROM blog_media WHERE ${where}`).get(...args)?.total ?? 0);
      const items = database.prepare(`SELECT * FROM blog_media WHERE ${where} ORDER BY created_at DESC, id LIMIT ? OFFSET ?`).all(...args, query.pageSize, (query.page - 1) * query.pageSize).map(decode);
      return { items, total, page: query.page, pageSize: query.pageSize };
    },
    updateAlt(id: string, alt: string) {
      get(id);
      database.prepare("UPDATE blog_media SET alt = ? WHERE id = ? AND deleted_at IS NULL").run(alt, id);
      return get(id);
    },
    remove(id: string, confirmation: string, removeFile: (media: BlogMedia) => void) {
      // No await inside this transaction: checks, removal and tombstone are
      // serialized against saves from every connection/process using this DB.
      database.exec("BEGIN IMMEDIATE");
      try {
        const media = get(id);
        if (confirmation !== media.fileName) throw new BlogError(400, "confirmation_required", "Confirme o nome do arquivo antes de excluir.");
        const usedBy = uses(media);
        if (usedBy.length) throw new BlogError(409, "media_in_use", "Esta imagem está em uso e não pode ser excluída.", usedBy.map(post => `${post.title} (${post.status})`));
        database.prepare("UPDATE blog_media SET deleted_at = ? WHERE id = ?").run(new Date().toISOString(), id);
        removeFile(media);
        database.exec("COMMIT");
      } catch (error) { database.exec("ROLLBACK"); throw error; }
    },
  };
}
export type MediaRepository = ReturnType<typeof createMediaRepository>;
