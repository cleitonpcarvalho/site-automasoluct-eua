"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import StrokeText from "@/components/react-bits/StrokeText";

const FIRST_LINE = "Need Jobber to do more?";
const SECOND_LINE = "We build custom solutions around it.";
const DESKTOP_QUERY = "(min-width: 768px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(query: string, onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const subscribeDesktop = (onChange: () => void) => subscribe(DESKTOP_QUERY, onChange);
const subscribeReduced = (onChange: () => void) => subscribe(REDUCED_QUERY, onChange);
const desktopSnapshot = () => window.matchMedia(DESKTOP_QUERY).matches;
const reducedSnapshot = () => window.matchMedia(REDUCED_QUERY).matches;
const serverSnapshot = () => false;

type HeadlineMetrics = {
  width: number;
  height: number;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  letterSpacing: number;
  glyphs: { x: number; y: number; color: string }[];
};

export function HeroStrokeHeadline({
  variant,
  className,
}: {
  variant: "mobile" | "desktop";
  className: string;
}) {
  const desktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, serverSnapshot);
  const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, serverSnapshot);
  const visible = variant === "desktop" ? desktop : !desktop;
  // The home has two responsive trees; only the visible one owns the H1.
  const Heading = visible ? "h1" : "div";
  const layoutRef = useRef<HTMLSpanElement>(null);
  const [metrics, setMetrics] = useState<HeadlineMetrics | null>(null);

  useLayoutEffect(() => {
    const layout = layoutRef.current;
    if (!layout || !visible || reduced) return;
    let cancelled = false;

    const measure = () => {
      if (cancelled || !layout.clientWidth) return;
      const bounds = layout.getBoundingClientRect();
      const style = getComputedStyle(layout);
      const glyphs: HeadlineMetrics["glyphs"] = [];

      layout.querySelectorAll<HTMLElement>("[data-headline-line]").forEach((line) => {
        const marker = line.querySelector<HTMLElement>("[data-headline-baseline]");
        if (!marker) return;
        const baseline = marker.getBoundingClientRect().top - bounds.top;
        const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        let firstTop: number | undefined;

        while ((node = walker.nextNode())) {
          const text = node.textContent ?? "";
          const color = getComputedStyle(node.parentElement ?? line).color;
          for (let offset = 0; offset < text.length; offset++) {
            const range = document.createRange();
            range.setStart(node, offset);
            range.setEnd(node, offset + 1);
            const rect = range.getBoundingClientRect();
            firstTop ??= rect.top;
            glyphs.push({
              x: rect.left - bounds.left,
              y: baseline + rect.top - firstTop,
              color,
            });
          }
        }
      });

      const next: HeadlineMetrics = {
        width: bounds.width,
        height: bounds.height,
        fontSize: parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily,
        letterSpacing: parseFloat(style.letterSpacing) || 0,
        glyphs,
      };
      setMetrics((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };

    // Measure only after the existing heading font is ready. HTML remains in
    // flow throughout; the SVG never determines the headline's dimensions.
    void document.fonts.ready.then(() => {
      if (!cancelled) {
        measure();
        observer.observe(layout);
      }
    });
    const observer = new ResizeObserver(measure);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [visible, reduced]);

  const animate = visible && !reduced && metrics !== null;
  const baseline = <span className="inline-block h-0 w-0 align-baseline" data-headline-baseline />;

  return (
    <Heading
      aria-label={`${FIRST_LINE} ${SECOND_LINE}`}
      aria-hidden={visible ? undefined : true}
      className={className}
      data-hero-stroke-headline={variant}
    >
      <span aria-hidden="true" className="relative block">
        <span
          className="block"
          ref={layoutRef}
          style={{ opacity: animate ? 0 : 1 }}
          data-headline-layout
        >
          <span className="block" data-headline-line>
            {baseline}Need <span className="text-primary">Jobber</span> to do more?
          </span>
          <span className="block" data-headline-line>{baseline}{SECOND_LINE}</span>
        </span>
        {animate && (
          <StrokeText
            text={FIRST_LINE + SECOND_LINE}
            trigger="mount"
            strokeStyle="solid"
            strokeWidth={1.2}
            drawDuration={1.4}
            fillDelay={0.15}
            stagger={0.035}
            ease="power2.out"
            fillMode="wipe"
            wipeFrom="left"
            strokeColor="#FFFFFF"
            fillColor="#FFFFFF"
            fontWeight={metrics.fontWeight}
            fontSize={metrics.fontSize}
            fontFamily={metrics.fontFamily}
            letterSpacing={metrics.letterSpacing}
            marching={false}
            hoverRedraw={false}
            shadow={false}
            glyphs={metrics.glyphs}
            viewport={metrics}
            style={{ position: "absolute", inset: 0 }}
          />
        )}
      </span>
    </Heading>
  );
}
