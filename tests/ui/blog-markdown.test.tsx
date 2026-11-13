import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import BlogPostPage from "@/app/blog/[slug]/page";
import AdminPreviewPage from "@/app/admin/(protected)/blog/[id]/preview/page";
import { BlogBlocks } from "@/components/blog/BlogBlocks";
import { BlogMarkdown } from "@/components/blog/BlogMarkdown";
import { InlineLinks } from "@/components/blog/InlineLinks";
import type { BlogPost } from "@/lib/blog/types";
import { completePostFixture } from "../blog/fixtures";
import published from "./fixtures/jobber-xero-markdown.json";

const source = vi.hoisted(() => ({
  getPublished: vi.fn(), listRecentPublished: vi.fn(() => []),
  getAdminPreview: vi.fn(), requireAdminPage: vi.fn(),
}));
vi.mock("@/lib/blog/service", () => ({ getBlogService: () => source }));
vi.mock("@/lib/blog/admin/access", () => ({ requireAdminPage: source.requireAdminPage }));
vi.mock("@/lib/blog/admin/handlers", () => ({ getAdminPreview: source.getAdminPreview }));
vi.mock("@/components/sections/contact/ContactAssessmentForm", () => ({ ContactAssessmentForm: () => null }));
afterEach(cleanup);

function savedPost(): BlogPost {
  return {
    ...completePostFixture(false), ...published.source, status: "published",
    createdAt: published.source.publishedAt, updatedAt: published.source.publishedAt,
    featuredImage: null,
    blocks: published.blocks.map(block => ({ ...block, type: "text" })),
  };
}

function checkPublishedExamples(container: HTMLElement) {
  const table = within(container).getByRole("table");
  expect(within(table).getAllByRole("columnheader").map(cell => cell.textContent)).toEqual([
    "Information from Jobber", "How the integration uses it",
  ]);
  expect(within(table).getAllByRole("row")).toHaveLength(7);
  expect(within(table).getByRole("cell", { name: "Approved estimate: $7,500" })).toBeDefined();
  expect(table.parentElement?.getAttribute("tabindex")).toBe("0");
  expect(table.parentElement?.getAttribute("aria-label")).toBe("Scrollable table");

  const code = container.querySelector("pre > code.language-json");
  const storedJson = published.blocks[1].content.split("```json\n")[1].split("```")[0];
  expect(code?.textContent).toBe(storedJson);
  expect(code?.parentElement?.getAttribute("tabindex")).toBe("0");
  expect(container.querySelector("p code")?.textContent).toBe("POST /Projects");
  expect(container.querySelectorAll("ol > li")).toHaveLength(7);
  expect(container.textContent).not.toContain("```json");
  expect(container.textContent).not.toContain("|---|---|");
}

test.each([true, false])("exact published table and JSON render without changing modern/legacy content (editorial=%s)", editorial => {
  const post = savedPost();
  if (!editorial) delete post.editorial;
  const before = structuredClone(post);
  const { container } = render(<BlogBlocks post={post} />);
  checkPublishedExamples(container);
  expect(post).toEqual(before);
});

test("public article and saved admin preview use identical Markdown rendering for the published revision", async () => {
  const post = savedPost();
  const before = structuredClone(post);
  source.getPublished.mockReturnValue(post);
  source.getAdminPreview.mockReturnValue(post);
  const publicPage = render(await BlogPostPage({ params: Promise.resolve({ slug: post.slug }) }));
  checkPublishedExamples(publicPage.container);
  const publicArticle = publicPage.container.querySelector("article")!.innerHTML;
  publicPage.unmount();

  const preview = render(await AdminPreviewPage({
    params: Promise.resolve({ id: post.id }),
    searchParams: Promise.resolve({ revision: String(post.revision) }),
  }));
  checkPublishedExamples(preview.container);
  expect(preview.container.querySelector("article")!.innerHTML).toBe(publicArticle);
  expect(source.getPublished).toHaveBeenCalledWith(post.slug);
  expect(source.requireAdminPage).toHaveBeenCalled();
  expect(source.getAdminPreview).toHaveBeenCalledWith(source, post.id, post.revision);
  expect(post).toEqual(before);
});

test("standard Markdown and GFM render semantic headings, lists, quotes, links, inline code and extensions", () => {
  const { container } = render(<BlogMarkdown content={[
    "# Heading one", "## Heading two", "### Heading three", "#### Heading four", "##### Heading five", "###### Heading six",
    "> A **useful** quote.", "- First item\n- Second item\n  - Nested item",
    "1. First step\n2. Second step", "Use `contactId`, *emphasis* and ~~old text~~.",
    "[Internal](/blog) and [External](https://developer.xero.com/documentation).",
    "https://developer.getjobber.com", "- [x] Finished\n- [ ] Pending",
    "A footnote[^note].\n\n[^note]: Supporting detail.",
    "---",
  ].join("\n\n")} />);
  for (let level = 1; level <= 6; level++) expect(screen.getByRole("heading", { level, name: /^Heading/ })).toBeDefined();
  expect(container.querySelector("blockquote strong")?.textContent).toBe("useful");
  expect(container.querySelectorAll("ul ul > li")).toHaveLength(1);
  expect(container.querySelectorAll("div > ol > li")).toHaveLength(2);
  expect(container.querySelector("p code")?.textContent).toBe("contactId");
  expect(container.querySelector("em")?.textContent).toBe("emphasis");
  expect(container.querySelector("del")?.textContent).toBe("old text");
  expect(screen.getByRole("link", { name: "Internal" }).getAttribute("target")).toBeNull();
  const external = screen.getByRole("link", { name: "External" });
  expect(external.getAttribute("target")).toBe("_blank");
  expect(external.getAttribute("rel")).toBe("noopener noreferrer");
  expect(screen.getByRole("link", { name: "https://developer.getjobber.com" }).getAttribute("href")).toBe("https://developer.getjobber.com");
  const checkboxes = screen.getAllByRole<HTMLInputElement>("checkbox");
  expect(checkboxes.every(input => input.disabled)).toBe(true);
  expect(checkboxes.map(input => input.checked)).toEqual([true, false]);
  expect(container.querySelector("section[data-footnotes]")).not.toBeNull();
  const footnote = screen.getByRole("link", { name: "1" });
  expect(footnote.getAttribute("aria-describedby")).toBe("footnote-label");
  expect(container.querySelector("a[href='#user-content-fnref-note']")).not.toBeNull();
  expect(footnote.id).toBe("user-content-fnref-note");
  expect(container.querySelector("hr")).not.toBeNull();
});

test("fences preserve blank lines, indentation and HTML as code, with or without a language", () => {
  const json = '{\n  "nested": {\n\n    "text": "<script>alert(1)</script>"\n  }\n}\n';
  const { container } = render(<BlogMarkdown content={`~~~json\n${json}~~~\n\n\`\`\`\n  no language\n\n    indentation\n\`\`\``} />);
  expect(container.querySelector("pre code.language-json")?.textContent).toBe(json);
  expect(container.querySelectorAll("pre code")[1].textContent).toBe("  no language\n\n    indentation\n");
  expect(container.querySelector("script")).toBeNull();
});

test("raw HTML, unregistered inline images and unsafe URLs do not become executable content", () => {
  const { container } = render(<BlogMarkdown content={[
    '<script>alert("unsafe")</script>', '<iframe src="https://example.com"></iframe>',
    '<img src="x" onerror="alert(1)">', '<a href="javascript:alert(1)">raw link</a>',
    '[javascript](javascript:alert%281%29)', '[data](data:text/html,test)', '[http](http://example.com)',
    '[protocol relative](//example.com)', '[credentials](https://user:password@example.com)',
    '![unregistered image](https://example.com/tracker.png)',
    '[safe](/blog/example) and [anchor](#free-assessment)',
  ].join("\n\n")} />);
  expect(container.querySelector("script, iframe, img, [onerror]")).toBeNull();
  expect(container.textContent).toContain('<script>alert("unsafe")</script>');
  expect(screen.getAllByRole("link").map(link => link.getAttribute("href"))).toEqual(["/blog/example", "#free-assessment"]);
});

test("inline fields share Markdown and URL rules without nesting block elements inside headings or paragraphs", () => {
  const { container } = render(<h3><InlineLinks content="**Contact** using `ContactID` and [Xero](https://www.xero.com)." /></h3>);
  expect(container.querySelector("h3 strong")?.textContent).toBe("Contact");
  expect(container.querySelector("h3 code")?.textContent).toBe("ContactID");
  expect(container.querySelector("h3 p, h3 div")).toBeNull();
  expect(screen.getByRole("link", { name: "Xero" }).getAttribute("rel")).toBe("noopener noreferrer");
});
