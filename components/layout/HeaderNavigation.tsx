"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { headerNavigation } from "@/lib/navigation";

export function HeaderNavigation() {
  const pathname = usePathname();
  return <NavigationMenu key={pathname} pathname={pathname} />;
}

function NavigationMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function links(mobile = false) {
    return headerNavigation.map(item => {
      const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
      return <Link
        aria-current={active ? "page" : undefined}
        className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft ${active ? "bg-primary/10 text-primary-soft" : "text-text-medium hover:bg-surface-2 hover:text-white"} ${mobile ? "w-full" : ""}`}
        href={item.href}
        key={item.href}
        onClick={() => setOpen(false)}
      >{item.label}</Link>;
    });
  }

  return <div ref={root}>
    <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">{links()}</nav>
    <button
      aria-controls={menuId}
      aria-expanded={open}
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      className="inline-flex size-11 items-center justify-center rounded-lg border border-border-strong text-text-medium hover:bg-surface-2 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft lg:hidden"
      onClick={() => setOpen(!open)}
      ref={toggle}
      type="button"
    >
      <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d={open ? "m6 6 12 12M6 18 18 6" : "M4 6h16M4 12h16M4 18h16"} /></svg>
    </button>
    <nav
      aria-label="Mobile navigation"
      className="absolute inset-x-0 top-full max-h-[calc(100svh-var(--header-height))] overflow-y-auto border-b border-border-strong bg-canvas px-4 py-3 shadow-xl lg:hidden"
      hidden={!open}
      id={menuId}
    ><div className="mx-auto flex max-w-7xl flex-col gap-1">{links(true)}</div></nav>
  </div>;
}
