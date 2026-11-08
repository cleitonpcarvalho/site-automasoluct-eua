"use client";

import {
  lazy,
  Suspense,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import type { CardSwapHandle } from "@/components/react-bits/CardSwap";
import { solutionCases, type SolutionCase } from "@/lib/solution-cases";

import { HomeIcon } from "./HomeIcon";
import { AutoplayControl, useAutoplayControl } from "./AutoplayControl";

const MOTION_QUERY = "(min-width: 1280px) and (prefers-reduced-motion: no-preference)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function canAnimate() {
  return window.matchMedia(MOTION_QUERY).matches;
}

function serverMotionSnapshot() {
  return false;
}

const CardSwap = lazy(() => import("@/components/react-bits/CardSwap"));

function SolutionCard({
  solution,
  index,
  mobile = false,
  stacked = false,
  id,
  labelledBy,
  active,
}: {
  solution: SolutionCase;
  index: number;
  mobile?: boolean;
  stacked?: boolean;
  id?: string;
  labelledBy?: string;
  active?: boolean;
}) {
  if (stacked) {
    return (
      <article
        aria-hidden={!active}
        aria-labelledby={labelledBy}
        inert={!active}
        className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-[inherit] border border-primary/25 bg-[#0B0B0D] text-white"
        id={id}
        role="tabpanel"
        tabIndex={-1}
      >
        <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] bg-[#111216] px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <HomeIcon className="size-4 shrink-0 text-primary-soft" name={solution.icon} />
            <h3 className="truncate font-heading text-[13px] font-semibold leading-5">
              {solution.title}
            </h3>
          </div>
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-text-low">
            <span className="text-primary-soft">{String(index + 1).padStart(2, "0")}</span>
            <span className="px-1.5">/</span>05
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          <p className="text-xs leading-5 text-text-medium">{solution.subtitle}</p>
          <ol
            aria-label={`${solution.title} workflow`}
            className="grid grid-cols-3 gap-4 rounded-lg border border-white/[0.07] bg-[#111216] p-3"
          >
            {solution.flow.map((step, stepIndex) => (
              <li className="relative flex min-w-0 flex-col gap-1.5" key={step}>
                <span className="font-mono text-[10px] leading-3 text-primary-soft">
                  {String(stepIndex + 1).padStart(2, "0")}
                </span>
                <span className="pr-1 text-xs font-medium leading-5">{step}</span>
                {stepIndex < 2 && (
                  <HomeIcon className="absolute -right-2 top-0 size-3 text-text-low" name="arrow-right" />
                )}
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-3">
            {solution.examples.map((example) => (
              <div className="flex items-start gap-2.5" key={example.title}>
                <HomeIcon className="mt-0.5 size-3.5 shrink-0 text-primary-soft" name={example.icon} />
                <div>
                  <h4 className="text-xs font-semibold leading-[18px]">{example.title}</h4>
                  <p className="mt-1 text-xs leading-5 text-text-medium">{example.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border-strong bg-surface-1 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)]"
    >
      <div aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-primary" />

      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5 md:px-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-low">
          Solution blueprint
        </span>
        <span className="font-mono text-[10px] tabular-nums text-text-low">
          <span className="text-primary-soft">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="px-1.5">/</span>05
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-5 md:p-6 lg:gap-7 lg:p-7">
        <div className="flex items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary-soft">
            <HomeIcon className="size-5" name={solution.icon} />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-bold leading-6 text-white md:text-xl">
              {solution.title}
            </h3>
            <p className="mt-1 text-xs leading-5 text-text-medium">
              {solution.subtitle}
            </p>
          </div>
        </div>

        <ol
          aria-label={`${solution.title} workflow`}
          className="grid grid-cols-1 gap-3 rounded-lg border border-border-subtle bg-surface-2 p-3 min-[480px]:grid-cols-3 md:grid-cols-1 md:gap-4 md:p-4 lg:grid-cols-3"
        >
          {solution.flow.map((step, stepIndex) => (
            <li className="relative flex min-w-0 flex-row items-start gap-2 min-[480px]:flex-col md:flex-row lg:flex-col" key={step}>
              <span className="font-mono text-[10px] text-primary-soft">
                {String(stepIndex + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 break-words pr-1 text-xs font-medium leading-5 text-white">
                {step}
              </span>
              {stepIndex < 2 && (
                <HomeIcon
                  className="absolute -right-2 top-0 hidden size-3 text-text-low min-[480px]:block md:hidden lg:-right-3 lg:block"
                  name="arrow-right"
                />
              )}
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-4">
          {solution.examples.map((example) => (
            <div className="flex items-start gap-2.5" key={example.title}>
              <HomeIcon
                className="mt-0.5 size-4 shrink-0 text-primary-soft"
                name={example.icon}
              />
              <div>
                <h4 className="text-xs font-semibold leading-5 text-white">
                  {example.title}
                </h4>
                <p className="mt-1 text-xs leading-5 text-text-medium">
                  {mobile ? example.mobileDescription : example.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function StaticSolutionsShowcase({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      data-solutions-layout="static"
    >
      {solutionCases.map((solution, index) => (
        <SolutionCard
          index={index}
          key={solution.id}
          mobile={mobile}
          solution={solution}
        />
      ))}
    </div>
  );
}

export function SolutionsShowcase() {
  const motionEnabled = useSyncExternalStore(
    subscribeToMotion,
    canAnimate,
    serverMotionSnapshot,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const swapRef = useRef<CardSwapHandle>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const instanceId = useId();
  const autoplay = useAutoplayControl();
  const stackId = `${instanceId}-stack`;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        nextIndex = (index + 1) % solutionCases.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        nextIndex = (index - 1 + solutionCases.length) % solutionCases.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = solutionCases.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    swapRef.current?.goTo(nextIndex);
    tabs.current[nextIndex]?.focus();
  }

  const items = solutionCases.map((solution, index) => ({
    id: `${instanceId}-panel-${solution.id}`,
    labelledBy: `${instanceId}-tab-${solution.id}`,
    content: (
      <SolutionCard
        active={index === activeIndex}
        id={`${instanceId}-panel-${solution.id}`}
        index={index}
        labelledBy={`${instanceId}-tab-${solution.id}`}
        solution={solution}
        stacked
      />
    ),
  }));

  // Match the final stack's dimensions during SSR and while its chunk loads.
  // CSS exposes the full static list on smaller screens and for reduced motion.
  const staticPanel = (
    <div className="flex h-[620px] min-w-0 items-center justify-center">
      <div className="grid w-full max-w-[520px]">
        {items.map((item, index) => (
          <div
            aria-hidden={index !== activeIndex}
            className="col-start-1 row-start-1 h-[420px] rounded-2xl"
            inert={index !== activeIndex}
            key={item.id}
            style={{ visibility: index === activeIndex ? "visible" : "hidden" }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="xl:motion-safe:hidden">
        <StaticSolutionsShowcase />
      </div>
      <div
        className="hidden min-w-0 grid-cols-[minmax(0,1fr)_680px] items-center gap-x-16 gap-y-2 xl:motion-safe:grid"
        data-solutions-layout="stack"
        data-autoplay-state={autoplay.paused ? "paused" : "playing"}
        {...autoplay.interactionProps}
      >
        <div
          aria-label="Solution blueprints"
          aria-orientation="vertical"
          className="flex min-w-0 flex-col gap-2"
          role="tablist"
        >
          {solutionCases.map((solution, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                aria-controls={`${instanceId}-panel-${solution.id}`}
                aria-selected={isActive}
                className={`relative flex min-h-[76px] w-full items-center gap-4 rounded-lg border px-4 py-4 text-left transition-colors duration-150 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-soft ${
                  isActive
                    ? "border-primary/35 bg-surface-2"
                    : "border-transparent bg-transparent hover:border-border-subtle hover:bg-surface-1"
                }`}
                id={`${instanceId}-tab-${solution.id}`}
                key={solution.id}
                onClick={() => swapRef.current?.goTo(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                ref={(element) => {
                  tabs.current[index] = element;
                }}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-4 left-0 w-0.5 rounded-r ${isActive ? "bg-primary" : "bg-transparent"}`}
                />
                <span
                  aria-hidden="true"
                  className={`font-mono text-[11px] tabular-nums ${isActive ? "text-primary-soft" : "text-text-low"}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span
                    className={`font-heading text-sm font-semibold ${isActive ? "text-white" : "text-text-medium"}`}
                  >
                    {solution.title}
                  </span>
                  <span className="text-xs leading-5 text-text-low">
                    {solution.subtitle}
                  </span>
                </span>
                <HomeIcon
                  className={`size-4 shrink-0 ${isActive ? "text-primary-soft" : "text-text-low"}`}
                  name="arrow-right"
                />
              </button>
            );
          })}
        </div>

        <div className="relative h-[620px] min-w-0" data-blueprint-stack id={stackId}>
          {motionEnabled ? (
            <Suspense fallback={staticPanel}>
              <CardSwap
                ref={swapRef}
                width={520}
                height={420}
                cardDistance={60}
                verticalDistance={55}
                depth={90}
                skewAmount={5}
                visibleCards={4}
                cardRadius={16}
                delay={4000}
                speed={1}
                bounce={0.35}
                parallax={0.4}
                hoverSpread={0.12}
                dim={0.45}
                autoplay={!autoplay.paused}
                pauseOnHover
                draggable
                intro
                onChange={setActiveIndex}
                ariaLabel={`Solution blueprints. Active: ${solutionCases[activeIndex].title}. Use arrow keys to change cards.`}
                style={{
                  "--swap-tile": "#0B0B0D",
                  "--swap-tile-edge": "rgba(10,78,228,0.25)",
                  "--swap-tile-highlight": "rgba(255,255,255,0.08)",
                  "--swap-shadow": "0 24px 58px -28px rgba(0,0,0,0.9), 0 0 26px -12px rgba(10,78,228,0.45)",
                  "--swap-ink": "#FFFFFF",
                  "--swap-shade": "#000000",
                } as CSSProperties}
              >
                {items.map((item) => <div className="h-full w-full" key={item.id}>{item.content}</div>)}
              </CardSwap>
            </Suspense>
          ) : (
            staticPanel
          )}
        </div>
        <div className="col-span-2 flex justify-end">
          <AutoplayControl
            controls={stackId}
            label="solution blueprints"
            onToggle={autoplay.toggle}
            paused={autoplay.userPaused}
          />
        </div>
      </div>
    </>
  );
}
