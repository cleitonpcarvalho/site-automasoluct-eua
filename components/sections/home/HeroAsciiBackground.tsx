"use client";

import {
  lazy,
  Suspense,
  useCallback,
  useState,
  useSyncExternalStore,
} from "react";

const GradientASCII = lazy(() => import("@/components/react-bits/GradientASCII"));
const MOTION_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const HERO_COLORS = ["#0A4EE4", "#2F6BFF", "#8FB2FF", "#F4F7FF"];

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function motionSnapshot() {
  return window.matchMedia(MOTION_QUERY).matches;
}

function serverSnapshot() {
  return false;
}

// Deterministic fallback: SSR, small screens, reduced motion and unavailable WebGL2.
const STATIC_ASCII = Array.from({ length: 34 }, (_, row) =>
  Array.from({ length: 112 }, (_, column) => {
    const seed = (column * 37 + row * 17 + column * row * 3) % 43;
    return seed < 10 ? ".:+01"[seed % 5] : " ";
  }).join(""),
).join("\n");
const DESKTOP_STATIC_ASCII = Array.from({ length: 44 }, (_, row) =>
  Array.from({ length: 150 }, (_, column) => {
    const seed = (column * 37 + row * 17 + column * row * 3) % 43;
    return seed < 31 ? " =+xX0S8#@"[seed % 10] : " ";
  }).join(""),
).join("\n");

export function HeroAsciiBackground({ animated = true }: { animated?: boolean }) {
  const motionAllowed = useSyncExternalStore(subscribeToMotion, motionSnapshot, serverSnapshot);
  const [unavailable, setUnavailable] = useState(false);
  const onUnavailable = useCallback(() => setUnavailable(true), []);

  // Mount as soon as desktop motion is allowed. The renderer owns viewport
  // pausing, including pages initially loaded with the hero out of view.
  const showRenderer = animated && motionAllowed && !unavailable;

  return (
    <div
      aria-hidden="true"
      className="group/hero-ascii pointer-events-none absolute inset-0 select-none overflow-hidden"
      data-hero-ascii
      data-hero-ascii-mode={showRenderer ? "animated" : "static"}
      inert
    >
      <div className={animated ? "absolute inset-0" : "absolute inset-y-0 -right-[8%] left-[20%]"}>
        <div
          className={`absolute inset-0 group-has-[canvas[data-ascii-state=running]]/hero-ascii:hidden ${animated ? "bg-[radial-gradient(ellipse_at_76%_56%,rgba(47,107,255,0.28),rgba(10,78,228,0.12)_38%,transparent_74%)]" : "bg-[radial-gradient(ellipse_at_70%_48%,rgba(10,78,228,0.16),transparent_65%)]"}`}
          data-ascii-fallback
        >
          <pre
            className={`absolute -right-[2%] top-1/2 m-0 -translate-y-1/2 bg-clip-text font-mono text-[10px] leading-5 tracking-[0.25em] text-transparent md:text-xs ${animated ? "opacity-65" : "opacity-30"}`}
            style={{
              backgroundImage: animated
                ? "linear-gradient(110deg, #0A4EE4 20%, #2F6BFF 55%, #8FB2FF 78%, #F4F7FF 95%)"
                : "linear-gradient(110deg, #0A4EE4 35%, #0A4EE4 65%, #C5C7CE 84%, #0A4EE4 95%)",
              maskImage: animated
                ? "radial-gradient(ellipse 85% 65% at 78% 48%, #000 12%, transparent 90%)"
                : "radial-gradient(ellipse 65% 60% at 72% 50%, #000 5%, transparent 85%)",
            }}
          >
            {animated ? DESKTOP_STATIC_ASCII : STATIC_ASCII}
          </pre>
        </div>
        {showRenderer && (
          <Suspense fallback={null}>
            <GradientASCII
              colors={HERO_COLORS}
              shape="horizon"
              characters=" =+xX0S8#@"
              cellSize={18}
              density={0.8}
              glyphOpacity={0.85}
              glow={0.2}
              depthOfField={0}
              flicker={0.2}
              softness={0.5}
              scale={1}
              flow={0.5}
              speed={1}
              gradientOpacity={0.9}
              grain={0.08}
              variation={0}
              mouseInteraction
              scrambleRadius={0.1}
              clickEffect="wave"
              intro
              lightMode={false}
              onUnavailable={onUnavailable}
            />
          </Suspense>
        )}
      </div>

      <div className={`absolute inset-0 ${animated ? "bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.94)_26%,rgba(0,0,0,0.84)_42%,rgba(0,0,0,0.58)_58%,transparent_78%,transparent_94%,#000_100%)]" : "bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.98)_32%,rgba(0,0,0,0.82)_48%,rgba(0,0,0,0.18)_78%,rgba(0,0,0,0.08)_100%)]"}`} />
      <div className={`absolute inset-0 ${animated ? "bg-[linear-gradient(180deg,#000_0%,transparent_8%,transparent_86%,#000_100%)]" : "bg-[linear-gradient(180deg,#000_0%,transparent_25%,transparent_72%,#000_100%)]"}`} />
    </div>
  );
}
