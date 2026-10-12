import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/Container";

import {
  IntegrationsIcon,
  type IntegrationsIconName,
} from "./IntegrationsIcon";

const frictionPoints: readonly {
  label: string;
  icon: IntegrationsIconName;
}[] = [
  { label: "Copying information manually between apps", icon: "copy" },
  { label: "Updating multiple platforms after jobs change", icon: "sync-problem" },
  { label: "Recreating files and customer folders by hand", icon: "folder" },
  { label: "Checking multiple systems for a single customer", icon: "search" },
  { label: "Manually triggering follow-up actions and reminders", icon: "reminder" },
  { label: "Reconciling data and correcting discrepancies later", icon: "rules" },
];

const platforms = [
  {
    name: "Xero / QBO",
    mobileName: "Xero",
    description: "Accounting & Tax Reconciliation",
    mobileDescription: "Accounting",
    alt: "Xero",
    src: "/assets/logos/logo-xero.png",
    imageClassName: "rounded-full",
  },
  {
    name: "Google Workspace",
    mobileName: "Google",
    description: "Drive Folders & Documentation",
    mobileDescription: "Drive & Docs",
    alt: "Google Workspace",
    src: "/assets/logos/logo-google-workspace.png",
    imageClassName: "",
  },
  {
    name: "CompanyCam",
    mobileName: "CompanyCam",
    description: "Field Photo & Site Pipelines",
    mobileDescription: "Field Photos",
    alt: "CompanyCam",
    src: "/assets/logos/logo-companycam.png",
    imageClassName: "rounded-md",
  },
  {
    name: "HighLevel CRM",
    mobileName: "HighLevel",
    description: "Lead Pipelines & Client Attribution",
    mobileDescription: "CRM & Pipeline",
    alt: "HighLevel",
    src: "/assets/logos/logo-hightlevel.png",
    imageClassName: "",
  },
] as const;

const systemCategories = [
  "Accounting",
  "CRM",
  "Cloud Storage",
  "Email",
  "Marketing",
  "Internal Systems",
  "Custom APIs",
] as const;

const capabilities: readonly {
  title: string;
  description: string;
  icon: IntegrationsIconName;
}[] = [
  {
    title: "Customer & Job Data",
    description:
      "Synchronize customer, quote, job, invoice, or operational information between systems.",
    icon: "swap",
  },
  {
    title: "Event-Based Automation",
    description:
      "Trigger workflows when something happens — such as a new lead, approved quote, completed job, or payment event.",
    icon: "bolt",
  },
  {
    title: "Document & File Workflows",
    description:
      "Create, organize, transfer, or link documents and operational files automatically.",
    icon: "folder",
  },
  {
    title: "Custom Business Logic",
    description:
      "Apply rules specific to the company before information is sent, transformed, or acted upon.",
    icon: "tune",
  },
];

const useCases = [
  {
    title: "Jobber + Xero",
    label: "Financial Sync",
    description:
      "Send or synchronize relevant accounting information based on the company’s workflow.",
  },
  {
    title: "Jobber + Google Workspace",
    label: "File Archive",
    description:
      "Automatically create and organize customer folders, operational documents, and related files.",
  },
  {
    title: "Jobber + CompanyCam",
    label: "Field Assets",
    description:
      "Connect field documentation and photo workflows to customer or job processes.",
  },
  {
    title: "Jobber + CRM / HighLevel",
    label: "Lead Pipeline",
    description:
      "Keep lead, customer, or pipeline information aligned with operational activity.",
  },
  {
    title: "Jobber + Custom System",
    label: "Direct API",
    description:
      "Connect Jobber to an internal application, database, API, or company-specific tool.",
  },
] as const;

const tiers = [
  {
    tier: "Tier 01",
    title: "Native Apps",
    description:
      "Suitable for standard point-to-point workflows with predefined fields and platform-specific configuration.",
    detail: "Standard integration scope",
    featured: false,
  },
  {
    tier: "Tier 02",
    title: "Generic Automation Tools",
    description:
      "Useful for connecting common workflows, with additional configuration often needed for complex transformations, conditional logic, or deeper data relationships.",
    detail: "Configurable automation layer",
    featured: false,
  },
  {
    tier: "Tier 03",
    title: "Automa Soluct",
    description:
      "Custom integration engineering designed around your business rules, edge cases, system relationships, and operational workflow.",
    detail: "Purpose-built integration scope",
    featured: true,
  },
] as const;

const processSteps = [
  {
    title: "Tell us the workflow",
    description: "Explain what currently happens and where the manual work exists.",
  },
  {
    title: "We evaluate the systems",
    description:
      "We review the available integration paths and design the appropriate solution.",
  },
  {
    title: "We build and connect it",
    description:
      "We implement, test, and deploy the integration around your existing operation.",
  },
] as const;

const assessmentSystems = [
  "Xero",
  "Google Workspace",
  "CompanyCam",
  "HighLevel",
  "Custom API / DB",
] as const;

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="flex max-w-3xl flex-col gap-1.5 md:gap-3">
      <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-primary md:text-xs">
        {eyebrow}
      </span>
      <h2 className="font-heading text-[28px] font-semibold leading-9 tracking-[-0.02em] text-white md:text-3xl md:leading-10 lg:text-[40px] lg:font-bold lg:leading-12">
        {title}
      </h2>
      {description ? (
        <p className="pt-1 text-sm leading-[22px] text-[#9CA3AF] md:text-base md:leading-[26px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function IntegrationsPageContent() {
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <section className="border-b border-white/[0.08]">
        <Container className="flex max-w-7xl flex-col gap-6 pb-10 pt-6 md:py-14 lg:grid lg:min-h-[590px] lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-24">
          <div className="flex max-w-3xl flex-col items-start gap-4 md:gap-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-surface-2 px-2 py-1 lg:rounded-full lg:px-3 lg:py-1.5">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#C5C7CE] md:text-xs">
                Custom Jobber Integrations
              </span>
            </div>

            <h1 className="font-heading text-[28px] font-bold leading-9 tracking-[-0.02em] text-white md:text-[40px] md:leading-12 lg:text-[56px] lg:leading-[64px] lg:tracking-[-0.03em]">
              Make Jobber work with the rest of your business.
            </h1>

            <p className="max-w-xl text-sm leading-[22px] text-[#C5C7CE] md:text-base md:leading-[26px]">
              Connect Jobber to the systems your team already uses — with custom
              integrations built around your actual workflow.
            </p>

            <div className="flex w-full flex-col gap-2 pt-1 sm:w-auto sm:flex-row md:gap-4 md:pt-2">
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft sm:w-auto"
                href="/contact"
              >
                Get a Free Assessment
                <IntegrationsIcon name="arrow-right" />
              </Link>
              <a
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/[0.08] bg-surface-2 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft sm:w-auto"
                href="sms:+13076224973"
              >
                <IntegrationsIcon className="size-[18px] text-primary" name="chat" />
                Text Us
              </a>
            </div>

            <div className="flex flex-col gap-1 pt-1 font-mono text-[11px] leading-4 text-[#71747E] md:flex-row md:flex-wrap md:items-center md:gap-2 md:pt-2 md:text-xs">
              <span className="flex flex-wrap items-center gap-2">
                <a className="transition-colors hover:text-white" href="mailto:hello@automasoluct.com">
                  hello@automasoluct.com
                </a>
                <span>•</span>
                <a className="transition-colors hover:text-white" href="tel:+13076224973">
                  +1 (307) 622-4973
                </a>
              </span>
              <span className="hidden md:inline">•</span>
              <span>Carvalho Technologies LLC</span>
            </div>
          </div>

          <aside className="hidden rounded-xl border border-white/[0.08] bg-surface-1 p-6 lg:col-span-5 lg:flex lg:flex-col lg:gap-6">
            <div className="flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-wider text-[#9CA3AF]">
              <span>Integration Overview</span>
              <span className="text-primary">Custom Integration</span>
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-white/[0.08] bg-surface-2 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white p-1.5">
                <Image
                  alt="Jobber"
                  className="size-full object-contain"
                  height={40}
                  src="/assets/logos/logo-jobber.png"
                  width={40}
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="font-heading text-lg font-semibold leading-[26px] text-white">
                  Jobber Core
                </span>
                <span className="text-xs leading-[18px] text-[#9CA3AF]">
                  Field operations, schedules, and quotes
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                [platforms[0], "Accounting"],
                [platforms[1], "Cloud Storage"],
                [platforms[2], "Field Documentation"],
                [platforms[3], "CRM"],
              ].map(([platform, category]) => {
                const item = platform as (typeof platforms)[number];
                return (
                  <div
                    className="flex min-h-[62px] items-center gap-3 rounded-lg border border-white/[0.08] bg-[#08080A] p-3"
                    key={item.name}
                  >
                    <Image
                      alt={item.alt}
                      className={`size-8 shrink-0 object-contain ${item.imageClassName}`}
                      height={32}
                      src={item.src}
                      width={32}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-xs font-semibold text-white">
                        {item.mobileName}
                      </span>
                      <span className="truncate text-[10px] leading-4 text-[#9CA3AF]">
                        {category as string}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 border-t border-white/[0.08] pt-3 text-xs text-[#9CA3AF]">
              <IntegrationsIcon className="size-4 shrink-0 text-primary" name="integration" />
              <span>Custom integration built around your actual operation.</span>
            </div>
          </aside>
        </Container>
      </section>

      <section className="border-b border-white/[0.08] bg-[#08080A]">
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-16">
          <SectionHeading
            description="Service companies often rely on multiple software tools: Jobber, accounting, CRM, cloud storage, field documentation, and email. When these tools don't talk to each other, operations grind to a halt."
            eyebrow="Disconnected Systems"
            title="Your operation shouldn’t depend on copying data between apps."
          />

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {frictionPoints.map((point) => (
              <article
                className="flex items-start gap-2 rounded-md border border-white/[0.08] bg-surface-1 p-4 md:gap-4 md:rounded-lg md:p-5"
                key={point.label}
              >
                <IntegrationsIcon className="mt-0.5 size-5 shrink-0 text-primary" name={point.icon} />
                <span className="text-sm leading-[22px] text-[#E5E7EB]">
                  {point.label}
                </span>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-white/[0.08]">
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-16">
          <SectionHeading
            eyebrow="Supported Platforms"
            title="Connect Jobber to the tools your business already relies on."
          />

          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex items-center gap-4 rounded-md border border-white/[0.08] bg-surface-2 p-4 md:justify-between md:gap-6 md:rounded-xl md:bg-surface-1 md:p-6">
              <div className="flex min-w-0 items-center gap-4 md:gap-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-white p-1.5">
                  <Image
                    alt="Jobber"
                    className="size-full object-contain"
                    height={48}
                    src="/assets/logos/logo-jobber.png"
                    width={48}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 md:gap-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-heading text-lg font-semibold leading-[26px] text-white md:text-[22px] md:leading-[30px]">
                      <span className="md:hidden">Jobber</span>
                      <span className="hidden md:inline">Jobber Core Hub</span>
                    </h3>
                    <span className="rounded bg-surface-1 px-1.5 py-0.5 font-mono text-[10px] text-primary md:hidden">
                      Core Hub
                    </span>
                  </div>
                  <p className="text-xs leading-[18px] text-[#9CA3AF] md:text-sm md:leading-[22px]">
                    Central field operations, scheduling, client records, and job dispatch.
                  </p>
                </div>
              </div>
              <span className="hidden shrink-0 rounded border border-white/[0.08] bg-surface-2 px-3 py-1 font-mono text-xs uppercase tracking-wider text-white md:inline-flex">
                Jobber Core
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
              {platforms.map((platform) => (
                <article
                  className="flex flex-col justify-between gap-2 rounded-md border border-white/[0.08] bg-[#08080A] p-4 md:gap-4 md:rounded-xl md:p-5"
                  key={platform.name}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <Image
                      alt={platform.alt}
                      className={`size-10 shrink-0 object-contain md:size-8 ${platform.imageClassName}`}
                      height={40}
                      src={platform.src}
                      width={40}
                    />
                    <h3 className="font-heading text-sm font-semibold leading-5 text-white md:text-lg md:leading-[26px]">
                      <span className="md:hidden">{platform.mobileName}</span>
                      <span className="hidden md:inline">{platform.name}</span>
                    </h3>
                  </div>
                  <p className="text-xs leading-[18px] text-[#71747E] md:text-[#C5C7CE]">
                    <span className="md:hidden">{platform.mobileDescription}</span>
                    <span className="hidden md:inline">{platform.description}</span>
                  </p>
                </article>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 pt-1 md:flex-row md:flex-wrap md:items-center md:gap-2">
              <span className="mr-2 font-mono text-[11px] uppercase tracking-wider text-[#71747E] md:text-xs">
                Supported Domains
              </span>
              <div className="flex flex-wrap gap-2">
                {systemCategories.map((category) => (
                  <span
                    className="rounded-md border border-white/[0.08] bg-[#08080A] px-2 py-1 font-mono text-[11px] text-[#C5C7CE] md:px-3 md:text-xs"
                    key={category}
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-md border border-white/[0.08] bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between md:rounded-lg">
              <p className="text-xs leading-[18px] text-[#9CA3AF] md:text-sm md:leading-[22px] md:text-[#D1D5DB]">
                Don’t see your software here? If it has a usable API, webhook,
                data export, or another reliable integration path, we can evaluate it.
              </p>
              <span className="inline-flex shrink-0 self-start items-center gap-1.5 rounded border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-primary sm:self-auto">
                <IntegrationsIcon className="size-4" name="verified" />
                Custom Evaluation
              </span>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-white/[0.08] bg-[#08080A]">
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-16">
          <SectionHeading
            eyebrow="Capabilities"
            title="The right data, in the right place, at the right time."
          />

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6">
            {capabilities.map((capability) => (
              <article
                className="flex flex-col gap-1.5 rounded-md border border-white/[0.08] bg-surface-1 p-4 md:gap-3 md:rounded-xl md:p-6"
                key={capability.title}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-surface-2 text-primary md:size-9">
                    <IntegrationsIcon className="size-5" name={capability.icon} />
                  </div>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-white md:font-heading md:text-lg md:leading-[26px] md:tracking-normal">
                    {capability.title}
                  </h3>
                </div>
                <p className="text-xs leading-[18px] text-[#9CA3AF] md:text-sm md:leading-[22px] md:text-[#C5C7CE]">
                  {capability.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-white/[0.08]">
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-16">
          <SectionHeading
            eyebrow="Real-World Use Cases"
            title="What a custom integration can look like."
          />

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6 lg:grid-cols-6">
            {useCases.map((useCase, index) => (
              <article
                className={`flex flex-col gap-1.5 rounded-md border border-white/[0.08] bg-[#08080A] p-4 md:gap-3 md:rounded-xl md:bg-surface-1 md:p-6 ${
                  index < 3 ? "lg:col-span-2" : "lg:col-span-3"
                }`}
                key={useCase.title}
              >
                <div className="flex items-center justify-between gap-3 md:flex-col md:items-start md:gap-3">
                  <span className="order-2 shrink-0 font-mono text-[10px] uppercase tracking-wider text-[#71747E] md:order-1 md:rounded md:border md:border-white/[0.08] md:bg-surface-2 md:px-2.5 md:py-0.5 md:text-xs">
                    {useCase.label}
                  </span>
                  <h3 className="order-1 font-heading text-lg font-semibold leading-[26px] text-white md:order-2">
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-xs leading-[18px] text-[#9CA3AF] md:text-sm md:leading-[22px] md:text-[#C5C7CE]">
                  {useCase.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-white/[0.08] bg-[#08080A]">
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-16">
          <SectionHeading
            description="Native integrations and configurable automation tools can cover many common workflows. When a business requires custom rules, unusual data mappings, multi-system coordination, or conditional workflows, custom engineering provides another integration path."
            eyebrow="Engineering Depth"
            title="When a standard integration isn’t enough."
          />

          <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-6">
            {tiers.map((tier) => (
              <article
                className={`flex flex-col justify-between gap-5 rounded-md border p-4 md:rounded-xl md:p-6 ${
                  tier.featured
                    ? "border-primary bg-surface-1"
                    : "border-white/[0.08] bg-[#08080A]"
                }`}
                key={tier.tier}
              >
                <div className="flex flex-col gap-1 md:gap-4">
                  <span
                    className={`font-mono text-xs uppercase tracking-wider ${
                      tier.featured ? "text-primary" : "text-[#71747E]"
                    }`}
                  >
                    {tier.tier}
                    <span className="md:hidden">: {tier.title}</span>
                  </span>
                  <h3 className="hidden font-heading text-lg font-semibold leading-[26px] text-white md:block">
                    {tier.title}
                  </h3>
                  <p className="text-xs leading-[18px] text-[#9CA3AF] md:text-sm md:leading-[22px] md:text-[#C5C7CE]">
                    {tier.description}
                  </p>
                </div>
                <span
                  className={`hidden font-mono text-xs lg:block ${
                    tier.featured ? "text-primary" : "text-[#71747E]"
                  }`}
                >
                  {tier.detail}
                </span>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-white/[0.08]">
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-16">
          <SectionHeading
            eyebrow="How We Work"
            title="Tell us which systems need to work together."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {processSteps.map((step, index) => (
              <article
                className="flex items-start gap-4 rounded-md border border-white/[0.08] bg-[#08080A] p-4 md:flex-col md:gap-4 md:rounded-xl md:bg-surface-1 md:p-6"
                key={step.title}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-xs font-bold text-white md:hidden">
                  0{index + 1}
                </div>
                <div className="flex flex-col gap-1 md:gap-4">
                  <span className="hidden font-mono text-xs tracking-wider text-primary md:block">
                    STEP 0{index + 1}
                  </span>
                  <h3 className="font-heading text-lg font-semibold leading-[26px] text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-[18px] text-[#9CA3AF] md:text-sm md:leading-[22px] md:text-[#C5C7CE]">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-white/[0.08]">
        <Container className="max-w-7xl py-4 md:py-12">
          <div className="flex items-start gap-2 rounded-md border border-white/[0.08] bg-surface-1 p-4 md:items-center md:gap-4 md:rounded-lg md:p-5">
            <IntegrationsIcon className="mt-0.5 size-5 shrink-0 text-primary md:mt-0 md:size-6" name="engineering" />
            <p className="text-sm italic leading-[22px] text-[#C5C7CE]">
              “Built by Cleiton Carvalho, Founder of Automa Soluct, with hands-on
              experience integrating Jobber with real operational systems used
              by U.S. service businesses.”
            </p>
          </div>
        </Container>
      </section>

      <section id="assessment">
        <Container className="max-w-7xl py-10 md:py-16 lg:py-24">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-md border border-white/[0.08] bg-surface-2 p-6 md:gap-8 md:rounded-2xl md:bg-surface-1 md:p-12 md:text-center">
            <div className="mx-auto flex max-w-2xl flex-col gap-1.5 md:gap-3">
              <h2 className="font-heading text-[28px] font-semibold leading-9 tracking-[-0.02em] text-white md:text-[40px] md:font-bold md:leading-12">
                What systems do you need Jobber to work with?
              </h2>
              <p className="text-sm leading-[22px] text-[#9CA3AF] md:text-base md:leading-[26px] md:text-[#C5C7CE]">
                Tell us what you use today, what you’re doing manually, and what
                you want to happen automatically.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 md:items-center">
              <span className="font-mono text-[11px] text-[#71747E] md:hidden">
                Systems to Connect
              </span>
              <div className="flex max-w-xl flex-wrap gap-1.5 md:justify-center md:gap-2.5">
                {assessmentSystems.map((system) => (
                  <span
                    className="rounded-md border border-white/[0.08] bg-surface-1 px-2.5 py-1.5 font-mono text-[11px] text-[#C5C7CE] md:rounded-full md:bg-surface-2 md:px-4 md:py-2 md:text-xs"
                    key={system}
                  >
                    {system}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:justify-center md:gap-4 md:pt-2">
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft sm:w-auto md:px-8 md:py-3.5"
                href="/contact"
              >
                Get a Free Assessment
                <IntegrationsIcon name="arrow-right" />
              </Link>
              <a
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/[0.08] bg-surface-1 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft sm:w-auto md:bg-surface-2 md:px-8 md:py-3.5"
                href="sms:+13076224973"
              >
                <IntegrationsIcon className="size-[18px] text-primary" name="chat" />
                Text Us
              </a>
            </div>

            <div className="flex flex-col gap-1 pt-1 text-center font-mono text-[11px] text-[#71747E] md:pt-2 md:text-xs">
              <span>
                Direct Email:{" "}
                <a className="text-white transition-colors hover:text-primary" href="mailto:hello@automasoluct.com">
                  hello@automasoluct.com
                </a>
              </span>
              <span>No sales pressure. Speak directly with an engineer about your workflow.</span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
