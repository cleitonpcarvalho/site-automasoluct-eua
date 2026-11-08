"use client";

import Image from "next/image";
import { lazy, Suspense, useId, useSyncExternalStore } from "react";

import { integrationCarouselItems, integrationPlatforms, type IntegrationPlatform } from "@/lib/integration-platforms";
import { AutoplayControl, useAutoplayControl } from "./AutoplayControl";

const CircularCarousel = lazy(() => import("@/components/react-bits/CircularCarousel"));
const MOTION_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
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

function PlatformLogo({ platform, large = false }: { platform: IntegrationPlatform; large?: boolean }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-lg ${large ? "size-16" : "size-10"} ${platform.central ? "bg-white p-1.5" : "bg-surface-2 p-1"}`}>
      <Image
        alt={platform.name}
        className="size-full object-contain"
        draggable={false}
        height={64}
        sizes={large ? "64px" : "40px"}
        src={platform.src}
        width={64}
      />
    </span>
  );
}

export function StaticIntegrationShowcase() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" data-integration-layout="static">
      {integrationPlatforms.map((platform) => (
        <li
          className={`flex min-h-[104px] flex-col gap-3 rounded-lg border bg-surface-1 p-4 ${platform.central ? "col-span-2 border-primary/30 sm:col-span-1" : "border-border-subtle"}`}
          key={platform.id}
        >
          <div className={`flex gap-3 ${platform.central ? "items-center" : "flex-col items-start md:flex-row md:items-center"}`}>
            <PlatformLogo platform={platform} />
            <div className="min-w-0">
              <h3 className="font-heading text-xs font-semibold leading-5 text-white">{platform.name}</h3>
              <p className={`mt-0.5 text-xs leading-5 ${platform.central ? "text-primary-soft" : "text-text-low"}`}>
                {platform.central ? "Central platform" : platform.category}
              </p>
            </div>
          </div>
          <p className="sr-only text-xs leading-5 text-text-medium lg:not-sr-only">{platform.description}</p>
        </li>
      ))}
    </ul>
  );
}

function CarouselPlaceholder() {
  return <div aria-hidden="true" className="h-[360px]" />;
}

export function IntegrationShowcase() {
  const motionAllowed = useSyncExternalStore(subscribe, motionSnapshot, serverSnapshot);
  const autoplay = useAutoplayControl();
  const carouselId = useId();

  return (
    <>
      <div className="lg:motion-safe:hidden"><StaticIntegrationShowcase /></div>
      <div
        className="relative hidden lg:motion-safe:block"
        data-integration-layout="cylinder"
        data-autoplay-state={autoplay.paused ? "paused" : "playing"}
        {...autoplay.interactionProps}
      >
        <div className="relative h-[360px]" id={carouselId}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[8%] inset-y-[12%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(10,78,228,0.09)_0%,rgba(10,78,228,0.025)_45%,transparent_72%)]"
          />
          {motionAllowed ? (
            <Suspense fallback={<CarouselPlaceholder />}>
              <CircularCarousel
                items={integrationCarouselItems}
                preset="cylinder"
                intro="rise"
                cardWidth={220}
                aspectRatio={1}
                speed={14}
                captions={false}
                gap={210}
                tilt={-8}
                curve={0.8}
                perspective={3400}
                autoplay={autoplay.paused ? "off" : "drift"}
                interval={3}
                direction="left"
                momentum={0.6}
                snap
                pauseOnHover
                focusOnClick
                draggable
                parallax={0.3}
                stretch={0.5}
                fadeColor="#000000"
                depthFade={0.3}
                innerShade={0.82}
                cornerRadius={12}
              />
            </Suspense>
          ) : <CarouselPlaceholder />}
        </div>
        <div className="mt-2 flex justify-end">
          <AutoplayControl
            controls={carouselId}
            label="connected systems"
            onToggle={autoplay.toggle}
            paused={autoplay.userPaused}
          />
        </div>
      </div>
    </>
  );
}
