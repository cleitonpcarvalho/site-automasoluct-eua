"use client";

import Script from "next/script";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type TurnstileRenderOptions = {
  sitekey: string;
  theme: "dark";
  callback: (token: string) => void;
  "error-callback": () => boolean;
  "expired-callback": () => void;
  "timeout-callback": () => void;
};

type TurnstileApi = {
  remove: (widgetId: string) => void;
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => string;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
};

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ onTokenChange }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const reset = useCallback(() => {
    onTokenChange("");

    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [onTokenChange]);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    if (
      !scriptReady ||
      !turnstileSiteKey ||
      !containerRef.current ||
      !window.turnstile ||
      widgetIdRef.current
    ) {
      return;
    }

    const resetInvalidWidget = () => {
      onTokenChange("");
      window.setTimeout(() => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      }, 0);
    };

    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: turnstileSiteKey,
      theme: "dark",
      callback: onTokenChange,
      "error-callback": () => {
        onTokenChange("");
        return true;
      },
      "expired-callback": resetInvalidWidget,
      "timeout-callback": resetInvalidWidget,
    });
    widgetIdRef.current = widgetId;

    return () => {
      if (window.turnstile) {
        window.turnstile.remove(widgetId);
      }
      widgetIdRef.current = null;
    };
  }, [onTokenChange, scriptReady]);

  return (
    <>
      <Script
        id="cloudflare-turnstile-script"
        onReady={() => setScriptReady(true)}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div
        aria-label="Security verification"
        className="flex min-h-[65px] w-full justify-center"
        ref={containerRef}
      />
    </>
  );
});
