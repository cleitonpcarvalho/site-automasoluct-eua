import { useEffect } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { ContactPageContent } from "@/components/sections/contact/ContactPageContent";
import { JobberAutomationContent } from "@/components/sections/jobber/JobberAutomationContent";
import { BlogBlocks } from "@/components/blog/BlogBlocks";
import type { BlogPost } from "@/lib/blog/types";
import { completePostFixture } from "../blog/fixtures";

// Mock the external SDK/script and HTTP response. The real pages, form, widget,
// native constraints, callbacks and submit flow run in the DOM.
const scriptEvents = vi.hoisted(() => ({
  ready: undefined as (() => void) | undefined,
  error: undefined as (() => void) | undefined,
  autoReady: true,
}));
vi.mock("next/script", () => ({
  default: function Script({ onReady, onError }: { onReady: () => void; onError: () => void }) {
    scriptEvents.ready = onReady;
    scriptEvents.error = onError;
    useEffect(() => { if (scriptEvents.autoReady) scriptEvents.ready?.(); }, []);
    return <script data-testid="turnstile-script" />;
  },
}));

type RenderOptions = Parameters<NonNullable<Window["turnstile"]>["render"]>[1];
let options: RenderOptions;
const provider = {
  // Match the real async-loaded SDK instead of hiding its 3857 guard.
  ready: vi.fn(() => {
    throw new Error("[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js script tag before using turnstile.ready().");
  }),
  render: vi.fn((_container: HTMLElement, config: RenderOptions) => { options = config; return "test-widget"; }),
  reset: vi.fn(),
  remove: vi.fn(),
};
let request: ReturnType<typeof vi.fn<typeof fetch>>;

beforeEach(() => {
  window.history.replaceState(null, "", "/contact");
  scriptEvents.autoReady = true;
  window.turnstile = provider;
  request = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 200 }));
  vi.stubGlobal("fetch", request);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  delete window.turnstile;
});

function BlogPage() {
  const post: BlogPost = { ...completePostFixture(false), id: "test-blog-post", status: "published", revision: 1, createdAt: "2026-01-01", updatedAt: "2026-01-01", publishedAt: "2026-01-01" };
  return <BlogBlocks post={post} />;
}

async function fillForm() {
  const user = userEvent.setup();
  const form = screen.getByRole("form", { name: "Request a free assessment" });
  await user.type(within(form).getByLabelText(/Full Name/), "Test User");
  await user.type(within(form).getByLabelText(/Business Name/), "Test Company");
  await user.type(within(form).getByLabelText(/Business Email/), "test@example.com");
  await user.type(within(form).getByLabelText(/Phone Number/), "+1 555 000 0000");
  await user.click(within(form).getByRole("radio", { name: "$2,500 – $5,000" }));
  await user.type(within(form).getByRole("textbox", { name: /What would you like to automate/ }), "Connect scheduling and invoicing.");
  return { user, form, button: within(form).getByRole<HTMLButtonElement>("button", { name: "Request Free Assessment" }) };
}

describe.each([
  ["blog article", BlogPage, "https://automasoluct.com/blog/jobber-quote-follow-up-automation", "normal"],
  ["contact", ContactPageContent, "https://automasoluct.com/contact", undefined],
  ["Jobber", JobberAutomationContent, "https://automasoluct.com/jobber-automation", undefined],
] as const)("shared form on %s", (_name, Page, sourcePage, size) => {
  beforeEach(() => {
    window.history.replaceState(null, "", sourcePage);
  });

  test("filled fields remain blocked with a visible explanation until the token arrives, then submit succeeds", async () => {
    render(<Page />);
    const { user, form, button } = await fillForm();
    expect(form.querySelector('[name="businessDescription"], [name="businessActivity"], [name="systemsInvolved"]')).toBeNull();
    expect(button.type).toBe("submit");
    expect(button.disabled).toBe(true);
    expect(screen.getByText(/Complete the security verification before sending/)).toBeDefined();
    expect(options.sitekey).toBe("1x00000000000000000000AA");
    expect(options.size).toBe(size);
    await act(async () => options.callback("verified-token"));
    expect(button.disabled).toBe(false);
    await user.click(button);
    await screen.findByRole("heading", { name: "Assessment Request Received" });
    expect(request).toHaveBeenCalledTimes(1);
    const [url, init] = request.mock.calls[0];
    expect(url).toBe("https://webhook.automasoluct.com.br/webhook/automasoluct-free-assessment");
    expect(init?.method).toBe("POST");
    const payload = JSON.parse(String(init?.body));
    expect(payload).toMatchObject({ fullName: "Test User", businessName: "Test Company", businessEmail: "test@example.com", phoneNumber: "+1 555 000 0000", jobberWorkflowRequest: "Connect scheduling and invoicing.", sourcePage, turnstileToken: "verified-token" });
    expect(payload.estimatedProjectBudget).toBe(new URL(sourcePage).pathname === "/jobber-automation" ? "2500-5000" : "$2,500 – $5,000");
    expect(payload.systemsInvolved).toEqual(new URL(sourcePage).pathname === "/jobber-automation" ? ["Jobber"] : []);
    expect(provider.reset).toHaveBeenCalledWith("test-widget");
    expect(provider.remove).toHaveBeenCalledWith("test-widget");
  });

  test("expiry clears eligibility and a refreshed token restores it", async () => {
    render(<Page />);
    const { button } = await fillForm();
    await act(async () => options.callback("old-token"));
    expect(button.disabled).toBe(false);
    await act(async () => options["expired-callback"]());
    expect(button.disabled).toBe(true);
    expect(screen.getByRole("alert").textContent).toMatch(/expired/);
    expect(provider.reset).toHaveBeenCalledWith("test-widget");
    await act(async () => options.callback("fresh-token"));
    expect(button.disabled).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });

  test("failed submission retains entered fields, clears the token, and can be retried with a fresh one", async () => {
    render(<Page />);
    const { user, form, button } = await fillForm();
    request.mockResolvedValueOnce(new Response(null, { status: 503 }));
    await act(async () => options.callback("first-token"));
    await user.click(button);
    await screen.findByText("Something went wrong. Please try again.");
    expect(button.disabled).toBe(true);
    expect((within(form).getByLabelText(/Full Name/) as HTMLInputElement).value).toBe("Test User");
    await act(async () => options.callback("retry-token"));
    await user.click(button);
    await screen.findByRole("heading", { name: "Assessment Request Received" });
    expect(request).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(request.mock.calls[1][1]?.body)).turnstileToken).toBe("retry-token");
  });
});

test("source attribution reads the full browser URL at submit time, including query and anchor", async () => {
  render(<BlogPage />);
  const { user, button } = await fillForm();
  await act(async () => options.callback("verified-token"));
  const submittedUrl = "https://automasoluct.com/blog/jobber-quote-follow-up-automation?utm_source=newsletter#free-assessment";
  window.history.replaceState(null, "", submittedUrl);
  await user.click(button);
  await screen.findByRole("heading", { name: "Assessment Request Received" });
  expect(request).toHaveBeenCalledTimes(1);
  expect(JSON.parse(String(request.mock.calls[0][1]?.body)).sourcePage).toBe(submittedUrl);
});

test("native required and email constraints give visible feedback instead of sending invalid values", async () => {
  render(<ContactPageContent />);
  const user = userEvent.setup();
  await act(async () => options.callback("verified-token"));
  await user.click(screen.getByRole("button", { name: "Request Free Assessment" }));
  expect(screen.getByRole("alert").textContent).toMatch(/Complete all required fields/);
  expect(request).not.toHaveBeenCalled();
  const { form, button } = await fillForm();
  const email = within(form).getByLabelText(/Business Email/);
  await user.clear(email);
  await user.type(email, "invalid-email");
  await user.click(button);
  expect(screen.getByRole("alert").textContent).toMatch(/valid business email/);
  expect(request).not.toHaveBeenCalled();
});

test("whitespace-only values are rejected without requiring the removed fields", async () => {
  render(<ContactPageContent />);
  const { user, form, button } = await fillForm();
  await act(async () => options.callback("verified-token"));
  const name = within(form).getByLabelText(/Full Name/);
  await user.clear(name);
  await user.type(name, "   ");
  await user.click(button);
  expect(screen.getByRole("alert").textContent).toBe("Enter your full name.");
  expect(request).not.toHaveBeenCalled();
});

test("direct submit without a token is rejected with an error", async () => {
  render(<ContactPageContent />);
  const { form } = await fillForm();
  fireEvent.submit(form);
  expect(screen.getByRole("alert").textContent).toMatch(/Complete the security verification/);
  expect(request).not.toHaveBeenCalled();
});

test("missing sitekey is visible and never initializes verification", () => {
  render(<TurnstileWidget onTokenChange={vi.fn()} siteKey="" />);
  expect(screen.getByRole("alert").textContent).toMatch(/Security verification is unavailable/);
  expect(provider.render).not.toHaveBeenCalled();
  expect(screen.queryByTestId("turnstile-script")).toBeNull();
});

test("async Turnstile loads render after Next Script readiness without calling SDK ready", async () => {
  // The real SDK throws 3857 from ready() for an async/defer script, even after
  // its load event. Next Script already supplies the readiness signal.
  scriptEvents.autoReady = false;
  const onTokenChange = vi.fn();
  render(<TurnstileWidget onTokenChange={onTokenChange} />);
  expect(provider.render).not.toHaveBeenCalled();
  await act(async () => scriptEvents.ready?.());
  expect(provider.ready).not.toHaveBeenCalled();
  expect(provider.render).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("alert")).toBeNull();
  await act(async () => options.callback("verified-token"));
  expect(onTokenChange).toHaveBeenLastCalledWith("verified-token");
});

test("script failure and provider errors clear the token and expose retry feedback", async () => {
  const onTokenChange = vi.fn();
  render(<TurnstileWidget onTokenChange={onTokenChange} />);
  await act(async () => options.callback("valid-token"));
  await act(async () => options["error-callback"]("110200"));
  expect(onTokenChange).toHaveBeenLastCalledWith("");
  expect(screen.getByRole("alert").textContent).toMatch(/verification failed/);
  await userEvent.click(screen.getByRole("button", { name: "Retry security verification" }));
  expect(provider.reset).toHaveBeenCalledWith("test-widget");
  await act(async () => scriptEvents.error?.());
  expect(screen.getByRole("alert").textContent).toMatch(/could not load/);
});

test("a blocked or stalled script reports a visible loading timeout", async () => {
  vi.useFakeTimers();
  scriptEvents.autoReady = false;
  const onTokenChange = vi.fn();
  render(<TurnstileWidget onTokenChange={onTokenChange} />);
  await act(async () => vi.advanceTimersByTime(15_000));
  expect(screen.getByRole("alert").textContent).toMatch(/did not load/);
  expect(onTokenChange).toHaveBeenLastCalledWith("");
  expect(provider.render).not.toHaveBeenCalled();
});

test("a late Script readiness event recovers from the loading timeout", async () => {
  vi.useFakeTimers();
  scriptEvents.autoReady = false;
  render(<TurnstileWidget onTokenChange={vi.fn()} />);
  await act(async () => vi.advanceTimersByTime(15_000));
  expect(screen.getByRole("alert").textContent).toMatch(/did not load/);
  expect(provider.render).not.toHaveBeenCalled();
  await act(async () => scriptEvents.ready?.());
  expect(provider.render).toHaveBeenCalledTimes(1);
  expect(provider.ready).not.toHaveBeenCalled();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("moving between pages starts with an empty token and ignores the previous widget", async () => {
  const blog = render(<BlogPage />);
  const previousWidget = options;
  await act(async () => previousWidget.callback("old-page-token"));
  blog.unmount();
  render(<ContactPageContent />);
  const button = screen.getByRole<HTMLButtonElement>("button", { name: "Request Free Assessment" });
  expect(button.disabled).toBe(true);
  await act(async () => previousWidget.callback("late-old-page-token"));
  expect(button.disabled).toBe(true);
  await act(async () => options.callback("current-page-token"));
  expect(button.disabled).toBe(false);
});

test("provider initialization failures are visible", () => {
  provider.render.mockImplementationOnce(() => { throw new Error("Provider not ready"); });
  render(<TurnstileWidget onTokenChange={vi.fn()} />);
  expect(screen.getByRole("alert").textContent).toMatch(/could not start/);
});

test("timeouts reset verification and callbacks from an unmounted page are ignored", async () => {
  const onTokenChange = vi.fn();
  const view = render(<TurnstileWidget onTokenChange={onTokenChange} />);
  await act(async () => options["timeout-callback"]());
  expect(screen.getByRole("alert").textContent).toMatch(/timed out/);
  expect(provider.reset).toHaveBeenCalledWith("test-widget");
  view.unmount();
  onTokenChange.mockClear();
  await act(async () => options.callback("late-token"));
  expect(onTokenChange).not.toHaveBeenCalled();
});
