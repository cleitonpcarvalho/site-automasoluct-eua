import Image from "next/image";
import Link from "next/link";

import { footerNavigation } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";

import { Container } from "./Container";

const socialLinks = [
  {
    name: "Instagram",
    href: siteConfig.social.instagram,
    icon: (
      <svg aria-hidden="true" className="size-5" fill="none" focusable="false" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <rect height="18" rx="5" width="18" x="3" y="3" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" fill="currentColor" r="1" stroke="none" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: siteConfig.social.youtube,
    icon: (
      <svg aria-hidden="true" className="size-5" fill="none" focusable="false" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <rect height="14" rx="4" width="20" x="2" y="5" />
        <path d="m10 8.5 6 3.5-6 3.5z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: siteConfig.social.facebook,
    icon: (
      <svg aria-hidden="true" className="size-5" fill="currentColor" focusable="false" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

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
            <nav aria-label="Social media" className="mt-4 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  aria-label={`Automa Soluct on ${social.name} (opens in a new tab)`}
                  className="inline-flex size-11 items-center justify-center rounded-lg border border-border-subtle bg-surface-2 text-text-medium transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-soft"
                  href={social.href}
                  key={social.name}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {social.icon}
                </a>
              ))}
            </nav>
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
