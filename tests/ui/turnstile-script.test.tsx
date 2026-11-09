import { act, fireEvent } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";

import { TurnstileWidget } from "@/components/forms/TurnstileWidget";

test("real Next Script initializes Turnstile after hydration and reuses the loaded script on remount", async () => {
  type RenderOptions = Parameters<NonNullable<Window["turnstile"]>["render"]>[1];
  const callbacks: RenderOptions[] = [];
  const provider = {
    ready: vi.fn(() => {
      throw new Error("[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js script tag before using turnstile.ready().");
    }),
    render: vi.fn((container: HTMLElement, options: RenderOptions) => {
      expect(container.isConnected).toBe(true);
      callbacks.push(options);
      return `widget-${callbacks.length}`;
    }),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  const onTokenChange = vi.fn();
  const container = document.createElement("div");
  document.body.appendChild(container);
  let root: Root | undefined;
  const widget = <TurnstileWidget onTokenChange={onTokenChange} siteKey="1x00000000000000000000AA" />;
  const source = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

  try {
    container.innerHTML = renderToString(widget);
    await act(async () => { root = hydrateRoot(container, widget); });
    const script = document.querySelector<HTMLScriptElement>(`script[src="${source}"]`);
    expect(script?.dataset.nscript).toBe("afterInteractive");
    expect(provider.render).not.toHaveBeenCalled();

    window.turnstile = provider;
    await act(async () => { fireEvent.load(script!); });
    expect(provider.ready).not.toHaveBeenCalled();
    expect(provider.render).toHaveBeenCalledTimes(1);
    expect(container.textContent).not.toContain("could not start");
    await act(async () => callbacks[0].callback("first-token"));
    expect(onTokenChange).toHaveBeenLastCalledWith("first-token");

    await act(async () => root?.unmount());
    root = undefined;
    expect(provider.remove).toHaveBeenCalledWith("widget-1");
    onTokenChange.mockClear();
    container.innerHTML = renderToString(widget);
    await act(async () => { root = hydrateRoot(container, widget); });
    expect(document.querySelectorAll(`script[src="${source}"]`)).toHaveLength(1);
    expect(provider.render).toHaveBeenCalledTimes(2);
    expect(provider.ready).not.toHaveBeenCalled();
    await act(async () => callbacks[0].callback("stale-token"));
    expect(onTokenChange).toHaveBeenLastCalledWith("");
    await act(async () => callbacks[1].callback("current-token"));
    expect(onTokenChange).toHaveBeenLastCalledWith("current-token");
  } finally {
    await act(async () => root?.unmount());
    container.remove();
    document.querySelector(`script[src="${source}"]`)?.remove();
    delete window.turnstile;
  }
});
