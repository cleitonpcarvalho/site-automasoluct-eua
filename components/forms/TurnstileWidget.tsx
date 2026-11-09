"use client";

import Script from "next/script";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useId,
  useRef,
  useState,
} from "react";

type TurnstileRenderOptions = {
  sitekey: string;
  theme: "dark";
  size?: "normal" | "compact";
  callback: (token: string) => void;
  "error-callback": (code: string) => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
};

type TurnstileApi = {
  remove: (widgetId: string) => void;
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => string | undefined;
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
  size?: "normal" | "compact";
  siteKey?: string;
};

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
type VerificationState =
  | { status: "loading" | "verifying" | "verified" }
  | { status: "error"; message: string; canRetry: boolean };

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ onTokenChange, size, siteKey = turnstileSiteKey }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [verification, setVerification] = useState<VerificationState>({
    status: "loading",
  });
  const statusId = useId();

  const fail = useCallback(
    (message: string) => {
      onTokenChange("");
      setVerification({
        status: "error",
        message,
        canRetry: Boolean(widgetIdRef.current),
      });
    },
    [onTokenChange],
  );

  const reset = useCallback(() => {
    onTokenChange("");
    setVerification({ status: "verifying" });

    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        fail("Security verification could not restart. Reload this page and try again.");
      }
    }
  }, [fail, onTokenChange]);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    if (!siteKey?.trim() || verification.status !== "loading") return;
    const timeout = window.setTimeout(
      () => fail("Security verification did not load. Reload this page and try again."),
      15_000,
    );
    return () => window.clearTimeout(timeout);
  }, [fail, siteKey, verification.status]);

  useEffect(() => {
    if (
      !scriptReady ||
      !siteKey?.trim() ||
      !containerRef.current ||
      !window.turnstile ||
      widgetIdRef.current
    ) {
      return;
    }

    let active = true;
    const api = window.turnstile;
    const resetInvalidWidget = (message: string) => {
      if (!active) return;
      fail(message);
      if (widgetIdRef.current) {
        try {
          api.reset(widgetIdRef.current);
        } catch {
          fail("Security verification could not restart. Reload this page and try again.");
        }
      }
    };

    // Next Script's onReady has already waited for the async SDK to load.
    // SDK ready() throws 3857 for async/defer scripts; render directly instead.
    onTokenChange("");
    setVerification({ status: "verifying" });
    try {
      const widgetId = api.render(containerRef.current, {
        sitekey: siteKey.trim(),
        theme: "dark",
        ...(size ? { size } : {}),
        callback: (token) => {
          if (!active) return;
          if (!token) {
            fail("Security verification did not complete. Please try again.");
            return;
          }
          onTokenChange(token);
          setVerification({ status: "verified" });
        },
        "error-callback": () => {
          if (active) {
            fail("Security verification failed. Please retry the security check or reload this page.");
          }
        },
        "expired-callback": () => resetInvalidWidget(
          "Security verification expired. Please complete the new security check.",
        ),
        "timeout-callback": () => resetInvalidWidget(
          "Security verification timed out. Please complete the new security check.",
        ),
      });
      if (!widgetId) throw new Error("Widget did not initialize.");
      widgetIdRef.current = widgetId;
    } catch {
      fail("Security verification could not start. Reload this page and try again.");
    }

    return () => {
      active = false;
      if (widgetIdRef.current) api.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [fail, onTokenChange, scriptReady, siteKey, size]);

  const missingKey = !siteKey?.trim();
  const hasError = missingKey || verification.status === "error";
  const message = missingKey
    ? "Security verification is unavailable. Please try again later."
    : verification.status === "error" ? verification.message
    : verification.status === "verified" ? "Security verification complete."
    : verification.status === "loading" ? "Loading security verification…"
    : "Complete the security verification before sending your request.";

  return (
    <>
      {!missingKey && (
        <Script
          id="cloudflare-turnstile-script"
          onReady={() => {
            if (!window.turnstile) {
              fail("Security verification could not load. Reload this page and try again.");
              return;
            }
            setScriptReady(true);
          }}
          onError={() => fail("Security verification could not load. Reload this page and try again.")}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      )}
      <div className="flex flex-col gap-2">
        <div
          aria-describedby={statusId}
          aria-label="Security verification"
          className="flex min-h-[65px] w-full justify-center"
          ref={containerRef}
        />
        <p
          aria-live="polite"
          className={`text-center text-xs leading-[18px] ${hasError ? "text-red-300" : "text-text-medium"}`}
          id={statusId}
          role={hasError ? "alert" : "status"}
        >
          {message}
        </p>
        {verification.status === "error" && verification.canRetry && (
          <button
            className="mx-auto min-h-11 text-sm font-semibold text-primary-soft hover:text-white"
            onClick={reset}
            type="button"
          >
            Retry security verification
          </button>
        )}
      </div>
    </>
  );
});
