import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";

type LegalPageContentProps = {
  children: ReactNode;
  effectiveDate: string;
  subtitle: string;
  title: string;
};

export function LegalPageContent({
  children,
  effectiveDate,
  subtitle,
  title,
}: LegalPageContentProps) {
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <header className="border-b border-white/[0.08]">
        <Container className="max-w-4xl py-10 md:py-16 lg:py-20">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-primary-soft">
              Legal
            </span>
            <h1 className="font-heading text-[34px] font-bold leading-tight tracking-[-0.025em] text-white md:text-[44px] md:leading-[52px]">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-text-medium md:text-base md:leading-7">
              {subtitle}
            </p>
            <p className="font-mono text-xs text-text-low">
              Effective date: {effectiveDate}
            </p>
          </div>
        </Container>
      </header>

      <Container className="max-w-4xl py-10 md:py-14 lg:py-16">
        <article className="flex flex-col gap-10 md:gap-12">{children}</article>
      </Container>
    </div>
  );
}

type LegalSectionProps = {
  children: ReactNode;
  title: string;
};

export function LegalSection({ children, title }: LegalSectionProps) {
  return (
    <section className="flex scroll-mt-28 flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold leading-7 tracking-[-0.01em] text-white md:text-2xl md:leading-8">
        {title}
      </h2>
      <div className="flex flex-col gap-4 text-sm leading-7 text-text-medium md:text-[15px]">
        {children}
      </div>
    </section>
  );
}

type LegalListProps = {
  children: ReactNode;
};

export function LegalList({ children }: LegalListProps) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-primary-soft">
      {children}
    </ul>
  );
}

export function LegalEmailLink() {
  return (
    <a
      className="w-fit font-medium text-primary-soft underline decoration-primary-soft/50 underline-offset-4 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-soft"
      href="mailto:hello@automasoluct.com"
    >
      hello@automasoluct.com
    </a>
  );
}
