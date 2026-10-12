import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/Container";

import { HomeIcon, type HomeIconName } from "./HomeIcon";
import { HomeMotionController } from "./HomeMotionController";

const trades = [
  "HVAC",
  "Plumbing",
  "Landscaping",
  "Roofing",
  "Electrical",
  "Pressure Washing",
  "Cleaning",
] as const;

const connectedSystems = [
  {
    name: "Google Drive",
    alt: "Google Workspace",
    src: "/assets/logos/logo-google-workspace.png",
    imageClassName: "size-7",
    heroDescription: "File structure sync",
    description: "Automated job folders & contracts",
  },
  {
    name: "CompanyCam",
    alt: "CompanyCam",
    src: "/assets/logos/logo-companycam.png",
    imageClassName: "size-7 rounded-md",
    heroDescription: "Site photo flow",
    description: "Field documentation & photo sync",
  },
  {
    name: "Xero / QBO",
    alt: "Xero",
    src: "/assets/logos/logo-xero.png",
    imageClassName: "size-7 rounded-full",
    heroDescription: "Ledger reconciliation",
    description: "Accounting data & tax reconciliation",
  },
  {
    name: "GoHighLevel",
    alt: "HighLevel",
    src: "/assets/logos/logo-hightlevel.png",
    imageClassName: "size-7",
    heroDescription: "Lead attribution",
    description: "CRM pipelines & lead capture sync",
  },
  {
    name: "Quo",
    alt: "Quo",
    src: "/assets/logos/logo-quo.png",
    imageClassName: "size-7 rounded-full",
    heroDescription: "Calls & Messaging",
    description: "Business Communications",
  },
] as const;

const capabilities: readonly {
  title: string;
  description: string;
  icon: HomeIconName;
}[] = [
  {
    title: "Automate Manual Work",
    description:
      "Eliminate repetitive operational data entry, duplicate invoicing steps, and manual dispatch status updates across teams.",
    icon: "bolt",
  },
  {
    title: "Connect Your Systems",
    description:
      "Seamlessly sync Jobber with accounting, photo documentation, CRM, and ad lead capture tools with zero data loss.",
    icon: "sync",
  },
  {
    title: "Build Custom Workflows",
    description:
      "Tailor unique quoting rules, job trigger sequences, and real-time customer SMS updates to your exact operating model.",
    icon: "workflow",
  },
  {
    title: "Create What’s Missing",
    description:
      "Develop bespoke internal tools, custom client portals, and tailored logic when standard off-the-shelf apps fall short.",
    icon: "terminal",
  },
];

const blueprints: readonly {
  title: string;
  description: string;
  icon: HomeIconName;
}[] = [
  {
    title: "Referral & Lead-Source Attribution",
    description:
      "Automatically capture source tags, UTM parameters, and lead forms directly into Jobber client custom fields.",
    icon: "target",
  },
  {
    title: "Payment-Triggered Workflows",
    description:
      "Auto-release lien waivers, trigger review request text messages, and notify territory managers instantly when payments clear.",
    icon: "payments",
  },
  {
    title: "Accounting & Xero/QBO Sync",
    description:
      "Deep multi-tier invoice sync with automated tax code mapping, customer deposit reconciliation, and class tracking.",
    icon: "receipt",
  },
  {
    title: "Google Workspace & Drive Sync",
    description:
      "Instantly structure customer folders, job site documentation, estimates, and executed contracts into organized cloud drives.",
    icon: "folder",
  },
  {
    title: "Field Photo & Documentation Pipelines",
    description:
      "Streamline before/after photo transfers from tools like CompanyCam directly to client notes and insurance claims.",
    icon: "photo",
  },
  {
    title: "Custom Dispatch Logic & Routing",
    description:
      "Route emergency calls and high-margin service contracts based on crew geo-coordinates and specific technician skill tags.",
    icon: "route",
  },
];

const processSteps = [
  {
    title: "Tell us what you need Jobber to do",
    description:
      "Share your specific operational bottleneck, manual chore, or missing integration with our technical team.",
  },
  {
    title: "We design the right solution around your workflow",
    description:
      "We map custom API connections, data schemas, and edge case rules tailored around your existing crew workflow.",
  },
  {
    title: "We build, integrate, test & deploy",
    description:
      "We deliver robust, reliable automation that runs quietly in the background without disrupting your daily crew dispatch.",
  },
] as const;

const trustSignals: readonly {
  label: string;
  icon: HomeIconName;
}[] = [
  { label: "Direct Engineer Communication", icon: "support" },
  { label: "Custom Code & Dedicated APIs", icon: "code" },
  { label: "U.S. Timezone Support", icon: "clock" },
];

type SectionHeadingProps = {
  className?: string;
  eyebrow: string;
  title: string;
  description?: string;
};

function SectionHeading({
  className,
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-primary-soft">
        {eyebrow}
      </span>
      <h2 className="max-w-4xl font-heading text-xl font-bold leading-tight text-white md:text-[28px] md:leading-9 lg:text-[32px] lg:leading-10">
        {title}
      </h2>
      {description ? (
        <p className="max-w-3xl text-xs leading-relaxed text-[#9CA3AF] md:text-sm md:leading-6">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function MobileHomeContent() {
  return (
    <div className="flex flex-1 flex-col bg-canvas md:hidden">
      <section>
        <Container className="flex max-w-7xl flex-col gap-5 pb-8 pt-6 md:gap-6 md:pb-14 md:pt-12 lg:grid lg:min-h-[590px] lg:grid-cols-12 lg:content-center lg:gap-x-12 lg:gap-y-6 lg:pb-20 lg:pt-16">
          <div className="inline-flex max-w-full items-center gap-2 self-start rounded-full border border-white/[0.08] bg-surface-2 px-3 py-1.5 lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:self-end">
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
            <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-[#D1D5DB]">
              Custom Jobber Solutions for U.S. Service Businesses
            </span>
          </div>

          <div className="flex max-w-3xl flex-col gap-2.5 md:max-w-4xl md:gap-3 lg:col-span-7 lg:col-start-1 lg:row-start-2 lg:self-start">
            <h1 className="font-heading text-[32px] font-extrabold leading-[38px] tracking-tight text-white md:text-[40px] md:leading-12 lg:text-[48px] lg:leading-[54px] lg:tracking-[-0.03em] xl:text-[52px] xl:leading-[58px]">
              Need <span className="text-primary">Jobber</span> to do more?
              <span className="block">We build custom solutions around it.</span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[#9CA3AF] md:max-w-3xl lg:max-w-xl lg:text-lg lg:leading-7">
              Custom automations, integrations, and software for U.S. service
              businesses that need more from their Jobber workflow.
            </p>
          </div>

          <div className="contents lg:col-span-7 lg:col-start-1 lg:row-start-3 lg:flex lg:flex-col lg:gap-6">
            <div className="flex max-w-3xl flex-wrap gap-1.5 md:max-w-none md:gap-2">
              {trades.map((trade) => (
                <span
                  className="rounded-md border border-white/[0.08] bg-surface-2 px-2.5 py-1 text-xs font-medium text-[#D1D5DB]"
                  key={trade}
                >
                  {trade}
                </span>
              ))}
            </div>

            <div className="flex max-w-3xl flex-col gap-2.5 pt-1 sm:flex-row">
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft active:bg-primary-active sm:w-auto lg:min-h-[50px] lg:px-6 lg:py-3.5"
                href="/contact"
              >
                Get a Free Assessment
                <HomeIcon name="arrow-right" />
              </Link>
              <a
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-surface-1 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft sm:w-auto lg:min-h-[50px] lg:px-6 lg:py-3.5"
                href="sms:+13076224973"
              >
                <HomeIcon className="size-[18px] text-primary" name="sms" />
                Text Us
              </a>
            </div>

            <div className="flex max-w-3xl items-start gap-2 pt-1 text-xs leading-relaxed text-[#9CA3AF]">
              <HomeIcon
                className="mt-px size-[18px] shrink-0 text-primary"
                name="verified"
              />
              <span>
                Direct software engineering • No generic templates • Carvalho
                Technologies LLC
              </span>
            </div>
          </div>

          <aside className="hidden self-center rounded-xl border border-white/[0.08] bg-surface-1 p-6 lg:col-span-5 lg:col-start-8 lg:row-span-3 lg:row-start-1 lg:block">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
                  <Image
                    alt="Jobber Symbol"
                    className="size-full object-contain"
                    height={44}
                    src="/assets/logos/logo-jobber.png"
                    width={44}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-heading text-sm font-bold text-white">
                    Jobber Ecosystem
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                    Connected Systems
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded border border-blue-500/20 bg-blue-500/10 px-2 py-1 font-mono text-[10px] font-medium text-blue-400">
                Custom Integration
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-5">
              {connectedSystems.map((system) => (
                <div
                  className="flex min-h-[68px] items-center gap-3 rounded-lg border border-white/[0.07] bg-surface-2 p-3"
                  key={`hero-${system.name}`}
                >
                  <Image
                    alt={system.alt}
                    className={`${system.imageClassName} shrink-0 object-contain`}
                    height={28}
                    src={system.src}
                    width={28}
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-xs font-semibold text-white">
                      {system.name}
                    </span>
                    <span className="text-[10px] leading-4 text-[#9CA3AF]">
                      {system.heroDescription}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-surface-2 p-3.5">
              <HomeIcon
                className="mt-0.5 size-[18px] shrink-0 text-primary"
                name="hub"
              />
              <p className="text-[11px] leading-5 text-[#9CA3AF]">
                Custom webhooks &amp; dedicated integration logic built directly
                for your field workflows.
              </p>
            </div>
          </aside>
        </Container>
      </section>

      <section className="border-y border-white/[0.08] bg-[#08080A]">
        <Container className="flex max-w-7xl flex-col gap-5 py-8 md:gap-8 md:py-14 lg:gap-10 lg:py-20">
          <SectionHeading
            description="We engineer custom automations, integrations, and data flows connecting Jobber to the other business software you rely on."
            eyebrow="Connected Systems"
            title="Your business uses more than one system. We make them work together."
          />

          <div className="contents md:flex md:flex-col md:gap-8 md:rounded-2xl md:border md:border-white/[0.08] md:bg-surface-1 md:p-6 lg:p-8">
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-x-4 md:gap-y-6">
              <div className="col-span-2 flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-surface-1 p-3.5 md:col-span-4 md:min-h-28 md:bg-surface-2 md:p-5 lg:min-h-24 lg:p-6">
                <div className="flex min-w-0 items-center gap-3 lg:gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white p-1 md:size-12 lg:size-14">
                    <Image
                      alt="Jobber Symbol"
                      className="size-full object-contain"
                      height={56}
                      src="/assets/logos/logo-jobber.png"
                      width={56}
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-heading text-sm font-bold text-white md:text-base lg:text-lg">
                      Jobber Ecosystem
                    </span>
                    <span className="text-xs text-[#9CA3AF] lg:text-sm">
                      <span className="md:hidden">Core Field Service Operations</span>
                      <span className="hidden md:inline">
                        Core Field Service Operations, Client Management,
                        Estimates &amp; Invoicing
                      </span>
                    </span>
                  </div>
                </div>
                <span className="shrink-0 rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 md:px-2.5 md:py-1">
                  <span className="md:hidden">Custom Sync</span>
                  <span className="hidden md:inline">Connected Systems</span>
                </span>
              </div>

              {connectedSystems.map((system) => (
                <div
                  className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-surface-1 p-3 text-center md:min-h-32 md:p-4 lg:min-h-28 lg:flex-row lg:justify-start lg:gap-3 lg:p-5 lg:text-left"
                  key={system.name}
                >
                  <Image
                    alt={system.alt}
                    className={`${system.imageClassName} shrink-0 object-contain md:size-8 lg:size-10`}
                    height={40}
                    src={system.src}
                    width={40}
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs font-medium text-[#E5E7EB] md:text-sm lg:font-semibold lg:text-white">
                      {system.name}
                    </span>
                    <span className="hidden text-[11px] leading-4 text-[#9CA3AF] lg:block">
                      {system.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-surface-2 p-3 md:p-4">
              <HomeIcon
                className="mt-0.5 size-[18px] shrink-0 text-primary"
                name="hub"
              />
              <p className="text-xs leading-relaxed text-[#9CA3AF] md:text-sm md:leading-6">
                <span className="md:hidden">
                  Bi-directional webhooks, dedicated API connections, and
                  automated workflows without intermediate sync dropouts.
                </span>
                <span className="hidden md:inline">
                  Custom webhooks, dedicated API connections, and workflow
                  automation designed around your operating process.
                </span>
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex max-w-7xl flex-col gap-5 py-8 md:gap-6 md:py-14 lg:gap-10 lg:py-20">
          <SectionHeading
            description="We extend what your team can accomplish with custom business logic and zero manual friction."
            eyebrow="Capabilities"
            title="Your workflow shouldn’t stop where Jobber does."
          />

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-6">
            {capabilities.map((capability) => (
              <article
                className="flex flex-col gap-2 rounded-lg border border-white/[0.08] bg-surface-1 p-4 md:min-h-44 md:gap-4 md:rounded-xl md:p-6"
                key={capability.title}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-surface-2 text-primary md:size-10">
                    <HomeIcon name={capability.icon} />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-white md:text-base">
                    {capability.title}
                  </h3>
                </div>
                <p className="max-w-xl text-xs leading-relaxed text-[#9CA3AF] md:text-sm md:leading-6">
                  {capability.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.08] bg-[#08080A]">
        <Container className="flex max-w-7xl flex-col gap-5 py-8 md:gap-6 md:py-14 lg:gap-10 lg:py-20">
          <SectionHeading
            description="Proven automations engineered for active home and field service operations:"
            eyebrow="Field Proven Blueprints"
            title="Built around real operational problems."
          />

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {blueprints.map((blueprint) => (
              <article
                className="flex flex-col gap-1.5 rounded-lg border border-white/[0.08] bg-surface-1 p-3.5 md:min-h-40 md:gap-3 md:rounded-xl md:p-5 lg:min-h-44"
                key={blueprint.title}
              >
                <div className="flex items-center gap-2 text-primary">
                  <HomeIcon className="size-[18px] shrink-0" name={blueprint.icon} />
                  <h3 className="font-heading text-xs font-bold text-white md:text-sm">
                    {blueprint.title}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-[#9CA3AF] md:text-[13px] md:leading-5">
                  {blueprint.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex max-w-7xl flex-col gap-5 py-8 md:gap-6 md:py-14 lg:gap-10 lg:py-20">
          <SectionHeading eyebrow="Process" title="How It Works" />

          <div className="flex max-w-3xl flex-col gap-3 md:grid md:max-w-none md:grid-cols-3 md:gap-4 lg:gap-6">
            {processSteps.map((step, index) => (
              <div
                className="flex gap-3 md:min-h-56 md:flex-col md:gap-5 md:rounded-xl md:border md:border-white/[0.08] md:bg-surface-1 md:p-5 lg:min-h-52 lg:p-6"
                key={step.title}
              >
                <div className="flex flex-col items-center md:w-full md:flex-row md:justify-between">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white md:size-9 md:text-sm">
                    {index + 1}
                  </div>
                  <span className="hidden font-mono text-[10px] uppercase tracking-wider text-text-low md:block">
                    Phase 0{index + 1}
                  </span>
                  {index < processSteps.length - 1 ? (
                    <div className="my-1 h-full w-px bg-white/[0.1] md:hidden" />
                  ) : null}
                </div>
                <div
                  className={`flex flex-col gap-1 ${
                    index < processSteps.length - 1 ? "pb-3 md:pb-0" : ""
                  }`}
                >
                  <h3 className="font-heading text-sm font-bold text-white md:text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#9CA3AF] md:text-sm md:leading-6">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.08] bg-[#08080A]">
        <Container className="flex max-w-7xl flex-col gap-5 py-8 md:gap-6 md:py-14 lg:py-20">
          <SectionHeading
            className="lg:hidden"
            eyebrow="Engineering Leadership"
            title="Engineered for operational durability."
          />

          <article className="flex max-w-3xl flex-col gap-4 rounded-lg border border-white/[0.08] bg-surface-1 p-4 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="size-16 shrink-0 overflow-hidden rounded-full border border-white/[0.1] bg-surface-2">
                <Image
                  alt="Cleiton Carvalho - Founder, Automa Soluct"
                  className="size-full object-cover"
                  height={64}
                  sizes="64px"
                  src="/assets/automasoluct/foto-perfil.png"
                  width={64}
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <h3 className="truncate font-heading text-base font-bold text-white">
                  Cleiton Carvalho
                </h3>
                <span className="text-xs font-semibold text-primary-soft">
                  Founder, Automa Soluct
                </span>
                <span className="text-[11px] text-[#9CA3AF]">
                  Carvalho Technologies LLC
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#D1D5DB]">
              Experienced software engineer specializing in API architecture,
              systems integration, and custom business automation. We partner
              directly with U.S. service business operators to build
              enterprise-grade reliability around Jobber.
            </p>

            <div className="grid grid-cols-1 gap-2 border-t border-white/[0.06] pt-1 sm:grid-cols-3">
              {trustSignals.map((signal) => (
                <div
                  className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-surface-2 p-2"
                  key={signal.label}
                >
                  <HomeIcon
                    className="size-[18px] shrink-0 text-primary"
                    name={signal.icon}
                  />
                  <span className="text-xs font-medium text-[#E5E7EB]">
                    {signal.label}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="hidden grid-cols-12 items-center gap-10 rounded-2xl border border-white/[0.08] bg-surface-1 p-10 lg:grid">
            <div className="col-span-5 flex justify-center">
              <div className="size-72 overflow-hidden rounded-2xl border border-white/[0.1] bg-surface-2">
                <Image
                  alt="Cleiton Carvalho - Founder, Automa Soluct"
                  className="size-full object-cover"
                  height={288}
                  sizes="288px"
                  src="/assets/automasoluct/foto-perfil.png"
                  width={288}
                />
              </div>
            </div>

            <div className="col-span-7 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-primary-soft">
                  Engineering Leadership
                </span>
                <h2 className="font-heading text-[32px] font-bold leading-10 text-white">
                  Engineered for operational durability.
                </h2>
              </div>

              <div className="flex flex-col gap-0.5">
                <h3 className="font-heading text-xl font-bold text-white">
                  Cleiton Carvalho
                </h3>
                <span className="text-sm font-semibold text-primary-soft">
                  Founder, Automa Soluct
                </span>
                <span className="text-xs text-[#9CA3AF]">
                  Carvalho Technologies LLC
                </span>
              </div>

              <p className="max-w-2xl text-sm leading-6 text-[#D1D5DB]">
                Experienced software engineer specializing in API architecture,
                systems integration, and custom business automation. We partner
                directly with U.S. service business operators to build
                enterprise-grade reliability around Jobber.
              </p>

              <div className="grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-5">
                {trustSignals.map((signal) => (
                  <div
                    className="flex min-h-14 items-center gap-2.5 rounded-lg border border-white/[0.05] bg-surface-2 p-3"
                    key={`desktop-${signal.label}`}
                  >
                    <HomeIcon
                      className="size-[18px] shrink-0 text-primary"
                      name={signal.icon}
                    />
                    <span className="text-[11px] font-medium leading-4 text-[#E5E7EB]">
                      {signal.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </Container>
      </section>

      <section>
        <Container className="max-w-7xl py-8 md:py-14 lg:py-20">
          <div className="flex max-w-3xl flex-col gap-4 rounded-xl border border-white/[0.1] bg-surface-1 p-5 md:mx-auto md:max-w-none md:gap-5 md:p-8 md:text-center lg:gap-8 lg:rounded-2xl lg:p-12">
            <div className="flex flex-col gap-1.5 md:mx-auto md:max-w-3xl">
              <div className="flex items-center gap-1.5 text-primary-soft md:justify-center">
                <HomeIcon name="clipboard-check" />
                <span className="font-heading text-[11px] font-bold uppercase tracking-wider">
                  Technical Assessment
                </span>
              </div>
              <h2 className="font-heading text-xl font-bold leading-tight text-white md:text-[28px] md:leading-9 lg:text-[32px] lg:leading-10">
                What do you wish Jobber could do?
              </h2>
              <p className="text-xs leading-relaxed text-[#9CA3AF] md:text-sm md:leading-6">
                Whether it’s a time-consuming manual step, a disconnected tool,
                or a custom feature your team needs—tell us what’s holding your
                operation back.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-1 sm:flex-row md:justify-center">
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft active:bg-primary-active sm:w-auto lg:min-h-[50px] lg:px-8 lg:py-3.5"
                href="/contact"
              >
                Get a Free Assessment
                <HomeIcon name="send" />
              </Link>
              <a
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-surface-2 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft sm:w-auto lg:min-h-[50px] lg:px-8 lg:py-3.5"
                href="sms:+13076224973"
              >
                <HomeIcon className="size-[18px] text-primary" name="chat" />
                Text Us: +1 (307) 622-4973
              </a>
            </div>

            <div className="flex items-start justify-center gap-1.5 pt-1 text-center">
              <HomeIcon
                className="mt-px size-3.5 shrink-0 text-[#9CA3AF]"
                name="check-circle"
              />
              <span className="text-[11px] text-[#9CA3AF]">
                No sales pressure. Speak directly with an engineer about your
                workflow.
              </span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

const desktopSystems = [
  {
    name: "QuickBooks Online",
    category: "Accounting",
    heroDescription: "Ledger Reconciliation",
    description:
      "Invoice and deposit synchronization with class and item code mapping.",
    alt: "QuickBooks Online",
    src: "/assets/logos/logo-quickbooks-online.png",
    imageClassName: "rounded-full",
  },
  {
    name: "Xero",
    category: "Ledger",
    heroDescription: "Accounting Sync",
    description:
      "Tax reconciliation and ledger updates as Jobber jobs finalize.",
    alt: "Xero",
    src: "/assets/logos/logo-xero.png",
    imageClassName: "rounded-full",
  },
  {
    name: "Google Workspace",
    heroName: "Google Workspace & Drive",
    category: "Cloud Storage",
    heroDescription: "Contracts & Folders",
    description:
      "Automated folder generation and file routing for estimates, proposals, and signed files.",
    alt: "Google Workspace",
    src: "/assets/logos/logo-google-workspace.png",
  },
  {
    name: "CompanyCam",
    category: "Field Visuals",
    heroDescription: "Field Photo Sync",
    description:
      "Automatic sync of before-and-after photos and inspection notes into Jobber client files.",
    alt: "CompanyCam",
    src: "/assets/logos/logo-companycam.png",
    imageClassName: "rounded",
  },
  {
    name: "HighLevel",
    category: "CRM & Marketing",
    heroDescription: "Lead Attribution",
    description:
      "Connections for inbound marketing leads, campaign attribution, and client status updates.",
    alt: "HighLevel",
    src: "/assets/logos/logo-hightlevel.png",
  },
  {
    name: "Quo",
    category: "Business Communications",
    heroDescription: "Calls & Messaging",
    description:
      "Calls and messaging connections for service-business communication workflows.",
    alt: "Quo",
    src: "/assets/logos/logo-quo.png",
    imageClassName: "rounded-full",
  },
] as const;

const desktopCapabilities: readonly {
  title: string;
  description: string;
  icon: HomeIconName;
}[] = [
  {
    title: "Automate Manual Work",
    description:
      "Eliminate repetitive operational data entry, duplicate invoicing steps, and manual dispatch status updates across teams.",
    icon: "bolt",
  },
  {
    title: "Connect Your Systems",
    description:
      "Sync Jobber with accounting, photo documentation, CRM, and lead-capture tools through carefully designed data flows.",
    icon: "sync",
  },
  {
    title: "Build Custom Workflows",
    description:
      "Tailor quoting rules, job-trigger sequences, and timely customer SMS updates to your operating model.",
    icon: "workflow",
  },
  {
    title: "Create What’s Missing",
    description:
      "Develop custom internal tools, client portals, and tailored logic when off-the-shelf apps fall short.",
    icon: "terminal",
  },
];

const desktopBlueprints: readonly {
  title: string;
  description: string;
  icon: HomeIconName;
}[] = [
  {
    title: "Referral & Lead-Source Attribution",
    description:
      "Capture source tags, UTM parameters, and lead forms directly into Jobber client custom fields.",
    icon: "target",
  },
  {
    title: "Payment-Triggered Workflows",
    description:
      "Release lien waivers, trigger review-request messages, and notify territory managers when payments clear.",
    icon: "payments",
  },
  {
    title: "Accounting & Xero/QBO Sync",
    description:
      "Multi-tier invoice sync with tax-code mapping, customer deposit reconciliation, and class tracking.",
    icon: "receipt",
  },
  {
    title: "Google Workspace & Drive Sync",
    description:
      "Structure customer folders, job-site documentation, estimates, and executed contracts in organized cloud drives.",
    icon: "folder",
  },
  {
    title: "Field Photo & Documentation Pipelines",
    description:
      "Streamline before-and-after photo transfers from tools like CompanyCam to client notes and insurance claims.",
    icon: "photo",
  },
  {
    title: "Custom Dispatch Logic & Routing",
    description:
      "Route emergency calls and priority service contracts using crew locations and technician skill tags.",
    icon: "route",
  },
];

type DesktopSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

function DesktopSectionHeading({
  eyebrow,
  title,
  description,
}: DesktopSectionHeadingProps) {
  return (
    <div
      className="flex max-w-2xl flex-col gap-3"
      data-reveal
      data-reveal-delay="0"
    >
      <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-primary-soft">
        {eyebrow}
      </span>
      <h2 className="font-heading text-[28px] font-bold leading-9 tracking-[-0.02em] text-white lg:text-[30px] lg:leading-10">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-relaxed text-[#9CA3AF]">{description}</p>
      ) : null}
    </div>
  );
}

type DesktopSystem = (typeof desktopSystems)[number];

function DesktopSystemMark({
  className = "size-8",
  system,
}: {
  className?: string;
  system: DesktopSystem;
}) {
  return (
    <Image
      alt={system.alt}
      className={`${className} home-logo shrink-0 object-contain ${
        "imageClassName" in system ? system.imageClassName : ""
      }`}
      height={32}
      src={system.src}
      width={32}
    />
  );
}

function DesktopHomeContent() {
  return (
    <div className="hidden flex-1 flex-col bg-canvas md:flex">
      <section>
        <Container className="grid max-w-7xl grid-cols-1 items-center gap-12 py-16 lg:grid-cols-12 lg:py-20 xl:pb-24">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <span
              className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-low"
              data-reveal
              data-reveal-delay="0"
            >
              Custom Jobber Solutions for U.S. Service Businesses
            </span>

            <div className="flex flex-col gap-5">
              <div
                aria-level={1}
                className="font-heading text-[38px] font-bold leading-[46px] tracking-[-0.025em] text-white lg:text-[40px] lg:leading-[48px] xl:text-[42px] xl:leading-[50px]"
                data-reveal
                data-reveal-delay="1"
                role="heading"
              >
                Need <span className="text-primary">Jobber</span> to do more?
                <span className="block text-[#E5E7EB]">
                  We build custom solutions around it.
                </span>
              </div>
              <p
                className="max-w-xl text-base leading-relaxed text-[#9CA3AF]"
                data-reveal
                data-reveal-delay="2"
              >
                Custom automations, integrations, and software for U.S. service
                businesses that need more from their Jobber workflow.
              </p>
            </div>

            <div
              className="flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]"
              data-reveal
              data-reveal-delay="3"
            >
              {["HVAC", "Plumbing", "Landscaping", "Cleaning"].map((trade) => (
                <span
                  className="rounded border border-white/[0.06] bg-surface-2 px-3 py-1 font-medium text-[#D1D5DB]"
                  key={trade}
                >
                  {trade}
                </span>
              ))}
              <span className="pl-1 font-mono text-text-low">
                + more service businesses
              </span>
            </div>

            <div
              className="flex flex-wrap items-center gap-4 pt-1"
              data-reveal
              data-reveal-delay="4"
            >
              <Link
                className="home-button inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft active:bg-primary-active"
                href="/contact"
              >
                Get a Free Assessment
                <HomeIcon className="home-arrow size-[18px]" name="arrow-right" />
              </Link>
              <a
                className="home-button inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-lg border border-white/[0.1] bg-[#08080A] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft"
                href="sms:+13076224973"
              >
                <HomeIcon
                  className="home-action-icon size-[18px] text-primary"
                  name="sms"
                />
                Text Us
              </a>
            </div>

            <p
              className="font-mono text-xs text-text-low"
              data-reveal
              data-reveal-delay="5"
            >
              Custom software built around real service workflows • Carvalho
              Technologies LLC
            </p>
          </div>

          <aside
            className="home-interactive-card rounded-2xl border border-white/[0.08] bg-[#08080A] p-6 lg:col-span-5 xl:p-8"
            data-reveal
            data-reveal-delay="2"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                  <Image
                    alt="Jobber"
                    className="home-logo size-full object-contain"
                    height={40}
                    src="/assets/logos/logo-jobber.png"
                    width={40}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-sm font-bold text-white">
                    Jobber
                  </h3>
                  <span className="font-mono text-[11px] text-text-low">
                    Central Platform
                  </span>
                </div>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-[#9CA3AF]">
                Direct Integration
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-4">
              {[
                desktopSystems[2],
                desktopSystems[3],
                desktopSystems[0],
                desktopSystems[1],
                desktopSystems[4],
                desktopSystems[5],
              ].map((system, index, systems) => (
                <div
                  className={`home-system-row flex min-h-9 items-center justify-between gap-4 rounded py-1.5 ${
                    index < systems.length - 1
                      ? "border-b border-white/[0.04]"
                      : ""
                  }`}
                  key={`hero-${system.name}`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <DesktopSystemMark className="size-6" system={system} />
                    <span className="truncate text-xs font-medium text-[#D1D5DB]">
                      {"heroName" in system ? system.heroName : system.name}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-text-low xl:text-[11px]">
                    {system.heroDescription}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </Container>
      </section>

      <section className="border-y border-white/[0.08]">
        <Container className="flex max-w-7xl flex-col gap-12 py-20 lg:py-24">
          <DesktopSectionHeading
            description="We engineer custom automations, integrations, and data flows connecting Jobber to the other business software you rely on."
            eyebrow="Connected Systems"
            title="Your business uses more than one system. We make them work together."
          />

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <article
              className="home-interactive-card flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-[#08080A] p-6 lg:col-span-4"
              data-reveal
              data-reveal-delay="0"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
                  <Image
                    alt="Jobber"
                    className="home-logo size-full object-contain"
                    height={44}
                    src="/assets/logos/logo-jobber.png"
                    width={44}
                  />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-white">
                    Jobber
                  </h3>
                  <span className="font-mono text-xs text-text-low">
                    Core Operational Platform
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[#9CA3AF]">
                Serves as your primary record for field dispatch, client
                records, job quotes, and operational scheduling.
              </p>
            </article>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-8">
              {desktopSystems.map((system, index) => (
                <article
                  className="home-interactive-card flex flex-col gap-2.5 rounded-xl border border-white/[0.06] bg-[#08080A] p-5"
                  data-reveal
                  data-reveal-delay={String(index % 6)}
                  key={`connected-${system.name}`}
                >
                  <div className="flex items-center gap-3">
                    <DesktopSystemMark system={system} />
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {system.name}
                      </h3>
                      <span className="font-mono text-[11px] text-text-low">
                        {system.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-[#9CA3AF]">
                    {system.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex max-w-7xl flex-col gap-14 py-20 lg:py-24">
          <DesktopSectionHeading
            description="We extend what your team can accomplish with custom business logic and less manual friction."
            eyebrow="Capabilities"
            title="Your workflow shouldn’t stop where Jobber does."
          />

          <div className="grid grid-cols-2 gap-8 border-t border-white/[0.08] pt-4 lg:grid-cols-4">
            {desktopCapabilities.map((capability, index) => (
              <article
                className="home-editorial-item flex flex-col gap-3.5"
                data-reveal
                data-reveal-delay={String(index)}
                key={capability.title}
              >
                <HomeIcon
                  className="home-action-icon size-6 text-primary"
                  name={capability.icon}
                />
                <h3 className="font-heading text-base font-bold text-white">
                  {capability.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#9CA3AF]">
                  {capability.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.08]">
        <Container className="flex max-w-7xl flex-col gap-14 py-20 lg:py-24">
          <DesktopSectionHeading
            description="Practical automation patterns designed for active home and field service operations."
            eyebrow="Field-Proven Blueprints"
            title="Built around real operational problems."
          />

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/[0.08] pt-4 lg:grid-cols-3 lg:gap-x-10">
            {desktopBlueprints.map((blueprint, index) => (
              <article
                className={`home-editorial-item flex flex-col gap-2.5 ${
                  index > 1 ? "border-t border-white/[0.04] pt-4" : ""
                } ${index === 2 ? "lg:border-t-0 lg:pt-0" : ""}`}
                data-reveal
                data-reveal-delay={String(index % 3)}
                key={blueprint.title}
              >
                <div className="flex items-center gap-2 text-primary">
                  <HomeIcon
                    className="home-action-icon size-5 shrink-0"
                    name={blueprint.icon}
                  />
                  <h3 className="font-heading text-sm font-bold text-white">
                    {blueprint.title}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-[#9CA3AF]">
                  {blueprint.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex max-w-7xl flex-col gap-14 py-20 lg:py-24">
          <DesktopSectionHeading eyebrow="Process" title="How It Works" />

          <div className="grid grid-cols-3 gap-8 border-t border-white/[0.08] pt-4 lg:gap-12">
            {processSteps.map((step, index) => (
              <article
                className="home-editorial-item flex flex-col gap-4"
                data-reveal
                data-reveal-delay={String(index)}
                key={step.title}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-primary-soft">
                    0{index + 1}
                  </span>
                  <span className="font-mono text-[11px] uppercase text-text-low">
                    Phase 0{index + 1}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-base font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#9CA3AF]">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.08] bg-[#08080A]">
        <Container className="max-w-7xl py-20">
          <article
            className="home-interactive-card grid grid-cols-1 items-center gap-10 rounded-2xl border border-white/[0.08] bg-surface-1 p-8 lg:grid-cols-12 lg:p-10"
            data-reveal
            data-reveal-delay="0"
          >
            <div className="flex justify-center lg:col-span-5">
              <div className="size-64 overflow-hidden rounded-2xl border border-white/[0.1] bg-surface-2 xl:size-72">
                <Image
                  alt="Cleiton Carvalho - Founder, Automa Soluct"
                  className="size-full object-cover"
                  height={288}
                  sizes="(min-width: 1280px) 288px, 256px"
                  src="/assets/automasoluct/foto-perfil.png"
                  width={288}
                />
              </div>
            </div>

            <div className="flex flex-col gap-5 lg:col-span-7">
              <div className="flex flex-col gap-1.5">
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-primary-soft">
                  Engineering Leadership
                </span>
                <h2 className="font-heading text-2xl font-bold leading-tight text-white">
                  Engineered for operational durability.
                </h2>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-white">
                  Cleiton Carvalho
                </h3>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-primary-soft">
                    Founder, Automa Soluct
                  </span>
                  <span className="text-xs text-text-low">•</span>
                  <span className="text-xs text-[#9CA3AF]">
                    Carvalho Technologies LLC
                  </span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#D1D5DB]">
                Experienced software engineer specializing in API architecture,
                systems integration, and custom business automation. We partner
                directly with U.S. service business operators to build durable
                systems around Jobber.
              </p>

              <div className="grid grid-cols-1 gap-3 border-t border-white/[0.08] pt-3 lg:grid-cols-3">
                {trustSignals.map((signal) => (
                  <div
                    className="home-interactive-card flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-surface-2 p-3"
                    key={`desktop-new-${signal.label}`}
                  >
                    <HomeIcon
                      className="size-[18px] shrink-0 text-primary"
                      name={signal.icon}
                    />
                    <span className="text-xs font-medium text-[#E5E7EB]">
                      {signal.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </Container>
      </section>

      <section>
        <Container className="max-w-7xl py-20">
          <div
            className="home-interactive-card flex flex-col items-center gap-8 rounded-2xl border border-white/[0.1] bg-surface-1 p-10 text-center lg:p-12"
            data-reveal
            data-reveal-delay="0"
          >
            <div className="flex max-w-2xl flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-primary-soft">
                <HomeIcon name="clipboard-check" />
                <span className="font-heading text-xs font-bold uppercase tracking-wider">
                  Technical Assessment
                </span>
              </div>
              <h2 className="font-heading text-[30px] font-bold leading-10 text-white">
                What do you wish Jobber could do?
              </h2>
              <p className="text-sm leading-relaxed text-[#9CA3AF]">
                Whether it’s a time-consuming manual step, a disconnected tool,
                or a custom feature your team needs—tell us what’s holding your
                operation back.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                className="home-button inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft active:bg-primary-active"
                href="/contact"
              >
                Get a Free Assessment
                <HomeIcon className="home-arrow size-[18px]" name="send" />
              </Link>
              <a
                className="home-button inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-lg border border-white/[0.08] bg-surface-2 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft"
                href="sms:+13076224973"
              >
                <HomeIcon
                  className="home-action-icon size-[18px] text-primary"
                  name="chat"
                />
                Text Us: +1 (307) 622-4973
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-center">
              <HomeIcon
                className="size-4 shrink-0 text-[#9CA3AF]"
                name="check-circle"
              />
              <span className="text-xs text-[#9CA3AF]">
                No sales pressure. Speak directly with an engineer about your
                workflow.
              </span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export function HomePageContent() {
  return (
    <>
      <MobileHomeContent />
      <HomeMotionController>
        <DesktopHomeContent />
      </HomeMotionController>
    </>
  );
}
