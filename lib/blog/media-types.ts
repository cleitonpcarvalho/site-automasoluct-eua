import type { ImageProvenance } from "./types.ts";
export type BlogMediaType = "featured" | "internal" | "other";
export type BlogMedia = {
  provenance?: ImageProvenance;
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  alt: string;
  type: BlogMediaType;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  size: number;
  width: number;
  height: number;
  createdAt: string;
};
export type MediaUse = { id: string; title: string; status: "draft" | "published" };
export type MediaPage = { items: BlogMedia[]; total: number; page: number; pageSize: number };
export type MediaQuery = { page: number; pageSize: number; search?: string };
