import "server-only";

import { randomUUID } from "node:crypto";
import type { DatabaseSync, SQLOutputValue } from "node:sqlite";

import { BlogError } from "./errors.ts";
import type { BlogPost, BlogPostFields, BlogPostSummary, PostPage, PostQuery, PostUpdate } from "./types.ts";

type Row = Record<string, SQLOutputValue>;
const summaryColumns = "id, title, subtitle, slug, seo_title, meta_description, focus_keyword, excerpt, featured_image, tags, status, revision, created_at, updated_at, published_at, editorial";

function summary(row: Row): BlogPostSummary {
  return {
    id: String(row.id), title: String(row.title), subtitle: String(row.subtitle), slug: String(row.slug),
    seoTitle: String(row.seo_title), metaDescription: String(row.meta_description), focusKeyword: String(row.focus_keyword),
    excerpt: String(row.excerpt), featuredImage: row.featured_image === null ? null : JSON.parse(String(row.featured_image)),
    tags: JSON.parse(String(row.tags)), ...(row.editorial == null ? {} : { editorial: JSON.parse(String(row.editorial)) }), status: row.status as BlogPost["status"], revision: Number(row.revision),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at), publishedAt: row.published_at === null ? null : String(row.published_at),
  };
}

function post(row: Row): BlogPost {
  return { ...summary(row), blocks: JSON.parse(String(row.blocks)), video: row.video === null ? null : JSON.parse(String(row.video)) };
}

function encode(fields: BlogPostFields) {
  return {
    title: fields.title, subtitle: fields.subtitle, slug: fields.slug, seo_title: fields.seoTitle,
    meta_description: fields.metaDescription, focus_keyword: fields.focusKeyword, excerpt: fields.excerpt,
    featured_image: fields.featuredImage ? JSON.stringify(fields.featuredImage) : null,
    blocks: JSON.stringify(fields.blocks), video: fields.video ? JSON.stringify(fields.video) : null,
    tags: JSON.stringify(fields.tags), editorial: fields.editorial ? JSON.stringify(fields.editorial) : null,
  };
}

function writeError(error: unknown): never {
  if (error instanceof Error && error.message.includes("blog_media_deleted")) {
    throw new BlogError(409, "media_deleted", "Uma imagem selecionada foi excluída. Selecione outra imagem antes de salvar.");
  }
  if (error instanceof Error && error.message.includes("UNIQUE constraint failed: blog_posts.slug")) {
    throw new BlogError(409, "slug_conflict", "This slug is already in use.");
  }
  throw error;
}

export function createPostRepository(database: DatabaseSync) {
  function get(id: string): BlogPost {
    const row = database.prepare("SELECT * FROM blog_posts WHERE id = ?").get(id);
    if (!row) throw new BlogError(404, "post_not_found", "Post not found.");
    return post(row);
  }

  function checkRevision(current: BlogPost, revision: number) {
    if (current.revision !== revision) throw new BlogError(409, "revision_conflict", "Post changed. Fetch the latest revision before retrying.");
  }

  return {
    get,
    getPublishedBySlug(slug: string): BlogPost | null {
      const row = database.prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'").get(slug);
      return row ? post(row) : null;
    },
    list(query: PostQuery): PostPage {
      const clauses: string[] = [];
      const parameters: string[] = [];
      if (query.status) { clauses.push("status = ?"); parameters.push(query.status); }
      if (query.search) {
        clauses.push("(title LIKE ? ESCAPE '\\' OR slug LIKE ? ESCAPE '\\')");
        const pattern = `%${query.search.replace(/[\\%_]/g, "\\$&")}%`;
        parameters.push(pattern, pattern);
      }
      const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
      const order = query.status === "published" && query.sort !== "updated" ? "published_at DESC, id" : "updated_at DESC, id";
      const total = Number(database.prepare(`SELECT count(*) AS total FROM blog_posts${where}`).get(...parameters)?.total ?? 0);
      const rows = database.prepare(`SELECT ${summaryColumns} FROM blog_posts${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...parameters, query.pageSize, (query.page - 1) * query.pageSize);
      return { items: rows.map(summary), total, page: query.page, pageSize: query.pageSize };
    },
    createDraft(fields: BlogPostFields): BlogPost {
      const id = randomUUID();
      const now = new Date().toISOString();
      const values = { id, ...encode(fields), status: "draft", revision: 1, created_at: now, updated_at: now, published_at: null };
      try {
        database.prepare(`INSERT INTO blog_posts (${Object.keys(values).join(", ")}) VALUES (${Object.keys(values).map(() => "?").join(", ")})`).run(...Object.values(values));
      } catch (error) { writeError(error); }
      return get(id);
    },
    update(id: string, update: PostUpdate): BlogPost {
      const current = get(id);
      checkRevision(current, update.revision);
      if (current.status === "published" && update.status !== "draft") {
        throw new BlogError(409, "published_post_requires_draft", "Explicitly set status to draft to withdraw and edit a published post. Publishing is always a separate action.");
      }
      const values = { ...encode({ ...current, ...update.changes }), status: "draft", published_at: null, updated_at: new Date().toISOString() };
      try {
        const result = database.prepare(`UPDATE blog_posts SET ${Object.keys(values).map(key => `${key} = ?`).join(", ")}, revision = revision + 1 WHERE id = ? AND revision = ?`).run(...Object.values(values), id, update.revision);
        if (!result.changes) throw new BlogError(409, "revision_conflict", "Post changed. Fetch the latest revision before retrying.");
      } catch (error) { writeError(error); }
      return get(id);
    },
    publish(id: string, revision: number): BlogPost {
      const current = get(id);
      checkRevision(current, revision);
      if (current.status !== "draft") throw new BlogError(409, "already_published", "This post is already published.");
      const now = new Date().toISOString();
      const result = database.prepare("UPDATE blog_posts SET status = 'published', published_at = ?, updated_at = ?, revision = revision + 1 WHERE id = ? AND revision = ? AND status = 'draft'").run(now, now, id, revision);
      if (!result.changes) throw new BlogError(409, "revision_conflict", "Post changed. Fetch the latest revision before retrying.");
      return get(id);
    },
    remove(id: string, revision: number): void {
      checkRevision(get(id), revision);
      const result = database.prepare("DELETE FROM blog_posts WHERE id = ? AND revision = ?").run(id, revision);
      if (!result.changes) throw new BlogError(409, "revision_conflict", "Post changed. Fetch the latest revision before retrying.");
    },
  };
}

export type PostRepository = ReturnType<typeof createPostRepository>;
