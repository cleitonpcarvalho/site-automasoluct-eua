"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  mobileNavigation,
  type NavigationIcon,
} from "@/lib/navigation";

function NavIcon({ name }: { name: NavigationIcon }) {
  const commonProps = {
    "aria-hidden": true,
    className: "size-[22px]",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  if (name === "home") {
    return (
      <svg {...commonProps}>
        <path d="M3.5 10.75 12 3.5l8.5 7.25" />
        <path d="M5.5 9.25V20h13V9.25M9.5 20v-6h5v6" />
      </svg>
    );
  }

  if (name === "sync_alt") {
    return (
      <svg {...commonProps}>
        <path d="M7 7h12m0 0-3-3m3 3-3 3M17 17H5m0 0 3 3m-3-3 3-3" />
      </svg>
    );
  }

  if (name === "hub") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="5" cy="5" r="2" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="m6.5 6.5 3.7 3.7m3.6 0 3.7-3.7m-7.3 7.3-3.7 3.7m7.3-3.7 3.7 3.7" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M4 4.5h16v12H8l-4 3v-15Z" />
      <path d="M8 8.5h8M8 12.5h5" />
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-canvas pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="mx-auto grid h-16 w-full max-w-xl grid-cols-4 px-1">
        {mobileNavigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 py-1 text-[10px] leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary ${
                isActive
                  ? "font-semibold text-primary-soft"
                  : "font-medium text-text-low hover:text-white"
              }`}
              href={item.href}
              key={item.href}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
