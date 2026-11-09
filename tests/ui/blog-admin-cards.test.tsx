import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { AdminPostCard } from "@/components/blog/admin/AdminPostCard";
import type { BlogPost } from "@/lib/blog/types";
import { completePostFixture } from "../blog/fixtures";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }) }));
afterEach(cleanup);

function post(status: BlogPost["status"]): BlogPost {
  return {
    ...completePostFixture(false), id: "test-card", slug: "test-card", status, revision: 3,
    createdAt: "2026-01-01T12:00:00Z", updatedAt: "2026-02-01T12:00:00Z",
    publishedAt: status === "published" ? "2026-01-02T12:00:00Z" : null,
  };
}

test("admin cards display the original featured image and preserve existing actions", () => {
  const article = post("published");
  render(<AdminPostCard csrf="test-csrf" post={article} />);
  const image = screen.getByRole<HTMLImageElement>("img", { name: article.featuredImage!.alt });
  expect(image.getAttribute("src")).toBe(article.featuredImage!.url);
  expect(screen.getByRole("heading", { name: article.title })).toBeDefined();
  expect(screen.getByRole("link", { name: "Editar" }).getAttribute("href")).toBe("/admin/blog/test-card");
  expect(screen.getByRole("link", { name: "Prévia salva r3" }).getAttribute("href")).toBe("/admin/blog/test-card/preview?revision=3");
  expect(screen.getByRole("button", { name: "Devolver para draft" })).toBeDefined();
  expect(screen.getByRole("button", { name: "Excluir" })).toBeDefined();
  const published = screen.getByRole("link", { name: "View Published Post" });
  expect(published.getAttribute("href")).toBe("/blog/test-card");
  expect(published.getAttribute("target")).toBe("_blank");
  expect(published.getAttribute("rel")).toBe("noopener noreferrer");
});

test("draft cards retain thumbnails but never offer the published-post link", () => {
  const article = post("draft");
  render(<AdminPostCard csrf="test-csrf" post={article} />);
  expect(screen.getByRole("img", { name: article.featuredImage!.alt })).toBeDefined();
  expect(screen.queryByRole("link", { name: "View Published Post" })).toBeNull();
  expect(screen.getByRole("button", { name: "Publicar" })).toBeDefined();
});

test("posts without a featured image show a subtle placeholder", () => {
  const article = { ...post("draft"), featuredImage: null };
  render(<AdminPostCard csrf="test-csrf" post={article} />);
  expect(screen.getByRole("img", { name: "No featured image" }).textContent).toContain("Sem capa");
  expect(screen.getByRole("article").querySelector("img")).toBeNull();
  expect(screen.getByRole("heading", { name: article.title })).toBeDefined();
});
