import Image from "next/image";
import Link from "next/link";

import { footerNavigation } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";

import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface-1 py-10 lg:py-16">
      <Container className="max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="flex max-w-sm flex-col gap-1.5 lg:col-span-5">
            <Link
              aria-label="Automa Soluct home"
              className="mb-1 hidden w-fit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:inline-flex"
              href="/"
            >
              <Image
                alt="Automa Soluct"
                className="h-8 w-auto object-contain"
                height={100}
                src={siteConfig.logo}
                width={230}
              />
            </Link>
            <span className="font-heading text-lg font-semibold text-white lg:hidden">
              {siteConfig.name}
            </span>
            <span className="font-mono text-xs text-primary-soft">
              {siteConfig.legalName}
            </span>
            <p className="mt-1 text-xs leading-5 text-text-medium">
              Engineering enterprise workflows &amp; custom software around
              Jobber for trade businesses.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-col gap-2 lg:col-span-4"
          >
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-text-low">
              Navigation
            </span>
            {footerNavigation.map((item) => (
              <Link
                className="w-fit text-xs text-text-medium transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-soft"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2 lg:col-span-3">
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-text-low">
              <span className="lg:hidden">Direct Engineering</span>
              <span className="hidden lg:inline">Contact</span>
            </span>
            <a
              className="w-fit text-xs text-text-medium transition-colors hover:text-white"
              href={`mailto:${siteConfig.email}`}
            >
              {siteConfig.email}
            </a>
            <a
              className="w-fit text-xs text-text-medium transition-colors hover:text-white"
              href={siteConfig.phoneHref}
            >
              {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-1 border-t border-border-subtle pt-4 text-[11px] leading-4 text-text-low sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Carvalho Technologies LLC. All rights reserved.</span>
          <span>Precision Engineering for Trade Operations.</span>
        </div>
      </Container>
    </footer>
  );
}
