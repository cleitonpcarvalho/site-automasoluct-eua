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
              className="mb-1 hidden min-h-11 w-fit items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:inline-flex"
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
            className="flex flex-col gap-0 lg:col-span-4 xl:gap-2"
          >
            <span className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-text-low xl:mb-0">
              Navigation
            </span>
            {footerNavigation.map((item) => (
              <Link
                className="inline-flex min-h-11 min-w-11 w-fit items-center py-2 text-xs text-text-medium transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-soft xl:min-h-0 xl:min-w-0 xl:py-0"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-0 lg:col-span-3 xl:gap-2">
            <span className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-text-low xl:mb-0">
              <span className="lg:hidden">Direct Engineering</span>
              <span className="hidden lg:inline">Contact</span>
            </span>
            <a
              className="inline-flex min-h-11 w-fit items-center py-2 text-xs text-text-medium transition-colors hover:text-white xl:min-h-0 xl:py-0"
              href={`mailto:${siteConfig.email}`}
            >
              {siteConfig.email}
            </a>
            <a
              className="inline-flex min-h-11 w-fit items-center py-2 text-xs text-text-medium transition-colors hover:text-white xl:min-h-0 xl:py-0"
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
