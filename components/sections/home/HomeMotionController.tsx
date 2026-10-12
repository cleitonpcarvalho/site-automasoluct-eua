"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

const DESKTOP_QUERY = "(min-width: 768px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const STAGGER_MS = 60;
const REVEAL_DURATION_MS = 620;

type HomeMotionControllerProps = {
  children: ReactNode;
};

export function HomeMotionController({ children }: HomeMotionControllerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    const revealImmediately = () => {
      revealItems.forEach((item) => {
        item.classList.add("is-revealed", "is-reveal-complete");
      });
    };

    if (
      !window.matchMedia(DESKTOP_QUERY).matches ||
      window.matchMedia(REDUCED_MOTION_QUERY).matches ||
      !("IntersectionObserver" in window)
    ) {
      revealImmediately();
      return;
    }

    root.dataset.motionReady = "true";

    let remainingItems = revealItems.length;
    const completionTimers = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const item = entry.target as HTMLElement;
          const delayStep = Number(item.dataset.revealDelay ?? 0);

          item.classList.add("is-revealed");
          observer.unobserve(item);
          remainingItems -= 1;

          const timer = window.setTimeout(() => {
            item.classList.add("is-reveal-complete");
            completionTimers.delete(timer);
          }, REVEAL_DURATION_MS + delayStep * STAGGER_MS);

          completionTimers.add(timer);
        });

        if (remainingItems === 0) {
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -8%",
        threshold: 0.12,
      },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      completionTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="home-motion-root contents" ref={rootRef}>
      {children}
    </div>
  );
}
