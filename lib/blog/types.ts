import type { imageAssociationStatus } from "./image-workflow.ts";
export type PostStatus = "draft" | "published";

export type ImageProvenance = { sourceAssets: ("default_cover_portrait" | "default_cover_logo")[]; source?: "generated" | "user_screenshot" | "workflow" | "system" | "diagram" | "other" };
export type BlogEditorial = { policyVersion: 1; videoRequestedByUser?: boolean; brandInBodyRequestedByUser?: boolean; suppliedScreenshotIds?: string[] };
export type BlogImage = {
  provenance?: ImageProvenance;
  id: string;
  url: string;
  alt: string;
  type: "featured" | "internal";
};

export type BlogVideo = {
  provider: "youtube" | "vimeo";
  id: string;
  title: string;
};

// IDs identify editorial slots. Array position is the rendering order.
export type BlogBlock =
  | { id: string; type: "text"; content: string }
  | { id: string; type: "heading"; content: string; level: 2 | 3 }
  | { id: string; type: "cta"; text: string; label: string; href: string }
  | { id: string; type: "image"; image: BlogImage | null; caption?: string }
  | { id: string; type: "video" }
  | { id: string; type: "form"; formId: "assessment" };

export type BlogPostFields = {
  editorial?: BlogEditorial;
  title: string;
  subtitle: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  excerpt: string;
  featuredImage: BlogImage | null;
  blocks: BlogBlock[];
  // The video block renders this optional, provider-validated reference.
  video: BlogVideo | null;
  tags: string[];
};

export type BlogPost = BlogPostFields & {
  id: string;
  status: PostStatus;
  revision: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type BlogPostSummary = Omit<BlogPost, "blocks" | "video">;

export type BlogValidationIssue = {
  code: string;
  field: string;
  message: string;
};

export type BlogPostValidation = {
  valid: boolean;
  postId: string;
  revision: number;
  errors: BlogValidationIssue[];
  warnings: BlogValidationIssue[];
  imageStatus?: ReturnType<typeof imageAssociationStatus>;
};

export type PostPage = {
  items: BlogPostSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type PostQuery = {
  page: number;
  pageSize: number;
  status?: PostStatus;
  search?: string;
  sort?: "updated";
};

export type PostUpdate = {
  revision: number;
  changes: Partial<BlogPostFields>;
  status?: "draft";
};
