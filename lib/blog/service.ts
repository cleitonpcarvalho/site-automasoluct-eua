import "server-only";

import { getBlogDatabase } from "./database.ts";
import { BlogError } from "./errors.ts";
import { readBlogImage } from "./media.ts";
import { assertPublicationReady, validateBlogPost } from "./publication.ts";
import { createPostRepository, type PostRepository } from "./repository.ts";
import { parseCreateDraft, parsePostId, parsePublishRequest, parseRevision, parseSlug, parseUpdatePost, parseValidateRequest } from "./validation.ts";
import type { BlogImage, BlogPost, PostQuery } from "./types.ts";

export function createBlogService(repository: PostRepository, checkImage: (image: BlogImage) => Promise<void> = async image => {
  await readBlogImage(image.url.slice("/uploads/blog/".length));
}) {
  function checkRevision(post: BlogPost, revision: number | undefined) {
    if (revision !== undefined && post.revision !== revision) throw new BlogError(409, "revision_conflict", "Post changed. Fetch the latest revision before retrying.");
  }
  async function validateSavedPost(post: BlogPost) {
    const result = await validateBlogPost(post, checkImage);
    // Do not attest readiness for a revision changed during asynchronous file checks.
    checkRevision(repository.get(post.id), post.revision);
    return result;
  }
  return {
    list(query: PostQuery) { return repository.list(query); },
    get(id: string) { return repository.get(parsePostId(id)); },
    listPublished(page = 1, pageSize = 10) { return repository.list({ status: "published", page, pageSize }); },
    getPublished(slug: string) {
      try { return repository.getPublishedBySlug(parseSlug(slug)); }
      catch (error) { if (error instanceof BlogError && error.status === 400) return null; throw error; }
    },
    createDraft(input: unknown) { return repository.createDraft(parseCreateDraft(input)); },
    update(id: string, input: unknown) { return repository.update(parsePostId(id), parseUpdatePost(input)); },
    remove(id: string, revision: number) { return repository.remove(parsePostId(id), parsePublishRequest({ revision })); },
    async validate(id: string, input: unknown = {}) {
      parsePostId(id);
      const revision = parseValidateRequest(input);
      const post = repository.get(id);
      checkRevision(post, revision);
      return validateSavedPost(post);
    },
    preview(id: string, revision?: number) {
      const post = repository.get(parsePostId(id));
      checkRevision(post, revision === undefined ? undefined : parseRevision(revision));
      return { postId: post.id, revision: post.revision, status: post.status, previewUrl: `/admin/blog/${post.id}/preview?revision=${post.revision}`, requiresAdminLogin: true };
    },
    async publish(id: string, input: unknown) {
      parsePostId(id);
      const revision = parsePublishRequest(input);
      const post = repository.get(id);
      checkRevision(post, revision);
      assertPublicationReady(await validateSavedPost(post));
      // Atomic compare-and-swap also checks for edits made during media validation.
      return repository.publish(id, revision);
    },
  };
}

export type BlogService = ReturnType<typeof createBlogService>;

export function getBlogService(): BlogService {
  return createBlogService(createPostRepository(getBlogDatabase()));
}
