import "server-only";

import { getBlogDatabase } from "./database.ts";
import { BlogError } from "./errors.ts";
import { readBlogImage } from "./media.ts";
import { validatePublication } from "./publication.ts";
import { createPostRepository, type PostRepository } from "./repository.ts";
import { parseCreateDraft, parsePostId, parsePublishRequest, parseSlug, parseUpdatePost } from "./validation.ts";
import type { BlogImage, PostQuery } from "./types.ts";

export function createBlogService(repository: PostRepository, checkImage: (image: BlogImage) => Promise<void> = async image => {
  await readBlogImage(image.url.slice("/uploads/blog/".length));
}) {
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
    async publish(id: string, input: unknown) {
      parsePostId(id);
      const revision = parsePublishRequest(input);
      const post = repository.get(id);
      if (post.revision !== revision) throw new BlogError(409, "revision_conflict", "Post changed. Fetch the latest revision before retrying.");
      validatePublication(post);
      const images = [post.featuredImage!, ...post.blocks.flatMap(block => block.type === "image" && block.image ? [block.image] : [])];
      for (const image of images) {
        try { await checkImage(image); }
        catch (error) {
          if (error instanceof BlogError && error.status === 404) throw new BlogError(422, "missing_image", "All referenced images must exist in blog storage before publication.");
          throw error;
        }
      }
      // Atomic compare-and-swap also checks for edits made during media validation.
      return repository.publish(id, revision);
    },
  };
}

export type BlogService = ReturnType<typeof createBlogService>;

export function getBlogService(): BlogService {
  return createBlogService(createPostRepository(getBlogDatabase()));
}
