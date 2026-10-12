import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

import { Container } from "./Container";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-canvas pt-[env(safe-area-inset-top)]">
      <Container className="flex h-16 max-w-7xl items-center justify-between gap-4 md:h-20">
        <Link
          aria-label="Automa Soluct home"
          className="inline-flex min-h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          href="/"
        >
          <Image
            alt="Automa Soluct"
            className="h-7 w-auto object-contain md:h-8"
            height={100}
            priority
            src={siteConfig.logo}
            width={230}
          />
        </Link>

        <Link
          className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 font-body text-xs font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft active:bg-primary-active md:min-h-11 md:px-5 md:py-2.5 md:text-sm"
          href="/contact"
        >
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M4 4.5h16v12H8l-4 3v-15Z" />
            <path d="M8 8.5h8M8 12.5h5" />
          </svg>
          Text Us
        </Link>
      </Container>
    </header>
  );
}
