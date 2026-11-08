"use client";

import { useState, type FocusEvent, type PointerEvent } from "react";

export function useAutoplayControl() {
  const [userPaused, setUserPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return {
    paused: userPaused || focused || hovered,
    userPaused,
    toggle: () => setUserPaused((previous) => !previous),
    interactionProps: {
      onFocusCapture: () => setFocused(true),
      onBlurCapture: (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      },
      onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === "mouse") setHovered(true);
      },
      onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === "mouse") setHovered(false);
      },
    },
  };
}

export function AutoplayControl({
  paused,
  onToggle,
  controls,
  label,
}: {
  paused: boolean;
  onToggle: () => void;
  controls: string;
  label: string;
}) {
  return (
    <button
      aria-controls={controls}
      aria-describedby={`${controls}-motion-help`}
      aria-label={`${paused ? "Play" : "Pause"} ${label} automatic rotation`}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border-subtle bg-surface-1 px-3 text-xs font-medium text-text-medium transition-colors hover:bg-surface-2 hover:text-white"
      onClick={onToggle}
      type="button"
    >
      {paused ? "Play" : "Pause"}
      <span className="sr-only" id={`${controls}-motion-help`}>
        Automatic rotation also pauses while this section is hovered or has keyboard focus.
      </span>
    </button>
  );
}
