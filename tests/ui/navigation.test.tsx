import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const location = vi.hoisted(() => ({ pathname: "/blog/test-article" }));
vi.mock("next/navigation", () => ({ usePathname: () => location.pathname }));
beforeEach(() => { location.pathname = "/blog/test-article"; });
afterEach(cleanup);

const routes = { Home: "/", "Jobber Automation": "/jobber-automation", Integrations: "/integrations", Blog: "/blog", Contact: "/contact" };

test("shared header links to all public sections and preserves the logo and Text Us CTA", () => {
  render(<Header />);
  const nav = screen.getByRole("navigation", { name: "Main navigation" });
  for (const [label, path] of Object.entries(routes)) {
    expect(within(nav).getByRole("link", { name: label }).getAttribute("href")).toBe(path);
  }
  expect(within(nav).getByRole("link", { name: "Blog" }).getAttribute("aria-current")).toBe("page");
  expect(within(nav).getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBeNull();
  expect(screen.getByRole("link", { name: "Automa Soluct home" }).getAttribute("href")).toBe("/");
  expect(screen.getByRole("link", { name: "Text Us" }).getAttribute("href")).toBe("/contact");
});

test("mobile menu is a keyboard-accessible disclosure with current links and Escape focus restoration", async () => {
  const user = userEvent.setup();
  render(<Header />);
  expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).toBeNull();
  const button = screen.getByRole("button", { name: "Open navigation menu" });
  expect(button.getAttribute("aria-expanded")).toBe("false");
  button.focus();
  await user.keyboard("{Enter}");
  const nav = screen.getByRole("navigation", { name: "Mobile navigation" });
  expect(button.getAttribute("aria-controls")).toBe(nav.id);
  expect(button.getAttribute("aria-expanded")).toBe("true");
  for (const [label, path] of Object.entries(routes)) expect(within(nav).getByRole("link", { name: label }).getAttribute("href")).toBe(path);
  await user.tab();
  expect(document.activeElement).toBe(within(nav).getByRole("link", { name: "Home" }));
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).toBeNull();
  expect(document.activeElement).toBe(button);
});

test("mobile menu closes after choosing a link or clicking outside", async () => {
  const user = userEvent.setup();
  render(<Header />);
  await user.click(screen.getByRole("button", { name: "Open navigation menu" }));
  const nav = screen.getByRole("navigation", { name: "Mobile navigation" });
  // Keep this a local UI check rather than navigating jsdom to another page.
  const link = within(nav).getByRole("link", { name: "Blog" });
  link.addEventListener("click", event => event.preventDefault());
  await user.click(link);
  expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Open navigation menu" }));
  const logo = screen.getByRole("link", { name: "Automa Soluct home" });
  logo.addEventListener("click", event => event.preventDefault());
  await user.click(logo);
  expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).toBeNull();
});

test("a route change closes the mobile menu and updates the current page", async () => {
  const user = userEvent.setup();
  const view = render(<Header />);
  await user.click(screen.getByRole("button", { name: "Open navigation menu" }));
  location.pathname = "/contact";
  view.rerender(<Header />);
  expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).toBeNull();
  const nav = screen.getByRole("navigation", { name: "Main navigation" });
  expect(within(nav).getByRole("link", { name: "Contact" }).getAttribute("aria-current")).toBe("page");
  expect(within(nav).getByRole("link", { name: "Blog" }).getAttribute("aria-current")).toBeNull();
  location.pathname = "/blog/test-article";
  view.rerender(<Header />);
  expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).toBeNull();
});

test("footer includes Blog alongside every existing link", () => {
  render(<Footer />);
  const nav = screen.getByRole("navigation", { name: "Footer navigation" });
  for (const [label, path] of Object.entries({ "Jobber Automation": "/jobber-automation", Integrations: "/integrations", Blog: "/blog", Contact: "/contact", Privacy: "/privacy", Terms: "/terms" })) {
    expect(within(nav).getByRole("link", { name: label }).getAttribute("href")).toBe(path);
  }
});
