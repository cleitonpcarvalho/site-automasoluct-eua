import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/Container";

import { AssessmentForm } from "./AssessmentForm";
import { JobberIcon, type JobberIconName } from "./JobberIcon";

const operationalReality: readonly {
  title: string;
  description: string;
  icon: JobberIconName;
}[] = [
  {
    title: "Manual Double-Entry",
    description:
      "Copying data between Jobber, spreadsheets, and other tools manually creates daily administrative drag and human error.",
    icon: "copy",
  },
  {
    title: "Disconnected Systems",
    description:
      "Jobber isolated from cloud drives, accounting software, or inbound ad lead generation channels.",
    icon: "unlink",
  },
  {
    title: "Unsupported Native Rules",
    description:
      "Custom pricing logic, tiered approval rules, dynamic markups, or delayed triggers that Jobber lacks natively.",
    icon: "rules",
  },
  {
    title: "Fragmented Field Data",
    description:
      "Job inspection photos, signed contracts, and client SMS history scattered across independent apps without unified records.",
    icon: "media",
  },
];

const capabilities: readonly {
  title: string;
  description: string;
  icon: JobberIconName;
}[] = [
  {
    title: "Automate Repetitive Work",
    description:
      "Eliminate manual office tasks, auto-generate quotes and invoices, and sync scheduling updates across your entire staff instantly.",
    icon: "repeat",
  },
  {
    title: "Connect Jobber to Other Systems",
    description:
      "Sync Jobber seamlessly with accounting, cloud storage, CRM, and field documentation platforms in real time.",
    icon: "sync",
  },
  {
    title: "Build Custom Workflows",
    description:
      "Implement business-specific logic, tiered approval triggers, dynamic margin calculators, and real-time operational alerts.",
    icon: "workflow",
  },
  {
    title: "Create What’s Missing",
    description:
      "Develop bespoke internal tools, custom sub-contractor portals, or proprietary software Jobber doesn't offer out of the box.",
    icon: "terminal",
  },
];

const examples: readonly {
  title: string;
  description: string;
  detail: string;
  icon: JobberIconName;
  detailIcon: JobberIconName;
}[] = [
  {
    title: "Referral & Lead-Source Tracking",
    description:
      "Capture UTM tags, paid ad sources, and form metadata into Jobber custom fields to preserve marketing attribution on every invoice.",
    detail: "Attribution Preservation",
    icon: "target",
    detailIcon: "tune",
  },
  {
    title: "Payment-Triggered Automation",
    description:
      "Auto-trigger review requests, notify regional managers, or release lien waivers the moment a Jobber invoice is marked paid.",
    detail: "Immediate Webhooks",
    icon: "payments",
    detailIcon: "repeat",
  },
  {
    title: "Accounting Integrations",
    description:
      "Deep two-way sync between Jobber and Xero or QuickBooks with custom item mapping, multi-rate tax handling, and deposit matching.",
    detail: "Two-Way Ledgers",
    icon: "accounting",
    detailIcon: "sync",
  },
  {
    title: "Google Workspace / Document Automation",
    description:
      "Auto-generate customer folders, contracts, and job archives in Google Drive upon quote conversion, linking them directly in Jobber.",
    detail: "Drive Auto-Structure",
    icon: "folder",
    detailIcon: "folder",
  },
  {
    title: "CRM & Custom Business Rules",
    description:
      "Sync leads with CRMs like HighLevel, execute tiered markup rules, and enforce custom technician qualification filters before booking.",
    detail: "HighLevel Sync + Gates",
    icon: "tune",
    detailIcon: "rules",
  },
];

const systems = [
  {
    name: "Jobber",
    mobileName: "Jobber",
    alt: "Jobber",
    src: "/assets/logos/logo-jobber.png",
    logoClassName: "bg-white p-1.5",
  },
  {
    name: "Google Workspace",
    mobileName: "Google",
    alt: "Google Workspace",
    src: "/assets/logos/logo-google-workspace.png",
    logoClassName: "bg-surface-2 p-1.5",
  },
  {
    name: "CompanyCam",
    mobileName: "CompanyCam",
    alt: "CompanyCam",
    src: "/assets/logos/logo-companycam.png",
    logoClassName: "bg-surface-2 p-1.5",
  },
  {
    name: "Xero",
    mobileName: "Xero",
    alt: "Xero",
    src: "/assets/logos/logo-xero.png",
    logoClassName: "rounded-full bg-surface-2 p-1.5",
  },
  {
    name: "HighLevel",
    mobileName: "HighLevel",
    alt: "HighLevel",
    src: "/assets/logos/logo-hightlevel.png",
    logoClassName: "bg-surface-2 p-1.5",
  },
] as const;

const processSteps = [
  {
    title: "Tell us the problem",
    description:
      "Explain what your office or field crew is doing manually, what system needs to connect, or what workflow Jobber doesn’t handle natively.",
  },
  {
    title: "We design the solution",
    description:
      "We review your operational flow, map out the data schemas and API requirements, and architect a reliable custom solution.",
  },
  {
    title: "We build and deploy",
    description:
      "We engineer, test in staging, and deploy the automation smoothly into your daily operations without disrupting active crews.",
  },
] as const;

const faqs = [
  {
    question: "Can you build custom automations for Jobber?",
    answer:
      "Yes. We build custom software, webhooks, and automation pipelines that extend what Jobber can do for your specific field operation.",
  },
  {
    question: "Can you integrate Jobber with other software?",
    answer:
      "Yes. We connect Jobber with accounting platforms (Xero, QBO), field media tools (CompanyCam), Google Workspace, CRMs (HighLevel), and custom internal databases.",
  },
  {
    question: "Can you build something Jobber does not support natively?",
    answer:
      "Yes. When standard Jobber features or third-party Zapier connections don’t meet your business logic requirements, we engineer custom scripts and tools to handle it.",
  },
  {
    question: "Do I need to replace my current Jobber setup?",
    answer:
      "No. Everything we build works alongside and enhances your existing Jobber account without disrupting active day-to-day dispatch or invoicing.",
  },
  {
    question: "Do you only work with specific service industries?",
    answer:
      "We work with small and medium-sized U.S. service businesses across a range of trades that use Jobber — including HVAC, plumbing, landscaping, roofing, cleaning, electrical, and pressure washing.",
  },
] as const;

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
  descriptionClassName?: string;
};

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  descriptionClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={`flex max-w-2xl flex-col gap-1.5 ${
        centered ? "lg:mx-auto lg:items-center lg:text-center" : ""
      }`}
    >
      <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-primary md:text-xs">
        {eyebrow}
      </span>
      <h2 className="font-heading text-[28px] font-semibold leading-9 tracking-[-0.02em] text-white md:text-3xl md:font-bold md:leading-10">
        {title}
      </h2>
      {description ? (
        <p
          className={`text-sm leading-[22px] text-[#9CA3AF] ${
            descriptionClassName ?? ""
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function JobberAutomationContent() {
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <section>
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:grid lg:min-h-[590px] lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-20 lg:pt-16">
          <div className="flex max-w-3xl flex-col items-start gap-4 lg:col-span-7 lg:gap-6">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-surface-2 px-2 py-1 lg:rounded-full lg:px-3.5 lg:py-1.5">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#C5C7CE] lg:font-heading lg:text-xs lg:font-semibold">
                Custom Jobber Automation
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="font-heading text-[28px] font-bold leading-9 tracking-[-0.02em] text-white md:text-[40px] md:leading-12 lg:text-[48px] lg:font-extrabold lg:leading-[54px]">
                Custom Jobber automation built around your workflow.
              </h1>
              <p className="max-w-2xl text-base leading-[26px] text-[#C5C7CE] lg:max-w-xl lg:text-lg lg:leading-7 lg:text-[#9CA3AF]">
                When Jobber doesn’t cover a process, integration, or business
                rule your operation needs, we build the custom solution around
                it.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row lg:gap-4 lg:pt-2">
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft sm:w-auto lg:min-h-[50px] lg:rounded-lg lg:py-3.5"
                href="/contact"
              >
                Get a Free Assessment
                <JobberIcon name="arrow-right" />
              </Link>
              <a
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/[0.08] bg-surface-1 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft sm:w-auto lg:min-h-[50px] lg:rounded-lg lg:py-3.5"
                href="sms:+13076224973"
              >
                <JobberIcon className="size-[18px] text-primary" name="chat" />
                Text Us
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] leading-4 text-[#71747E] lg:text-xs">
              <a className="transition-colors hover:text-white" href="mailto:hello@automasoluct.com">
                hello@automasoluct.com
              </a>
              <span>•</span>
              <a className="transition-colors hover:text-white" href="tel:+13076224973">
                +1 (307) 622-4973
              </a>
              <span>•</span>
              <span>Carvalho Technologies LLC</span>
            </div>
          </div>

          <aside className="hidden rounded-xl border border-white/[0.08] bg-surface-1 p-6 lg:col-span-5 lg:flex lg:flex-col lg:gap-5">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
                  <Image
                    alt="Jobber"
                    className="size-full object-contain"
                    height={40}
                    src="/assets/logos/logo-jobber.png"
                    width={40}
                  />
                </div>
                <div className="flex min-w-0 flex-col">
                  <h2 className="truncate font-heading text-base font-bold text-white">
                    Jobber Workflow
                  </h2>
                  <span className="text-xs text-[#9CA3AF]">Field Operations Hub</span>
                </div>
              </div>
              <span className="shrink-0 rounded border border-white/[0.08] bg-surface-2 px-2.5 py-1 text-xs font-medium text-[#D1D5DB]">
                Custom Automation
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                ["Dispatch & Field Workflows", "Custom Workflow", "route"],
                ["Document & Drive Automation", "Document Flow", "folder"],
                ["Accounting Integration", "Accounting Sync", "accounting"],
                ["CRM & Lead Attribution", "Lead Tracking", "workflow"],
              ].map(([title, label, icon], index) => (
                <div className="contents" key={title}>
                  <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-surface-2 p-3 text-xs">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <JobberIcon
                        className="size-[18px] shrink-0 text-primary"
                        name={icon as JobberIconName}
                      />
                      <span className="truncate font-medium text-white">
                        {index + 1}. {title}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-[#9CA3AF]">
                      {label}
                    </span>
                  </div>
                  {index < 3 ? (
                    <JobberIcon
                      className="mx-auto -my-1 size-3.5 text-[#4B5563]"
                      name="down"
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-white/[0.08] pt-4 text-xs text-[#9CA3AF]">
              <JobberIcon className="size-4 shrink-0 text-primary" name="workflow" />
              <span>Custom integration built around your operation.</span>
            </div>
          </aside>
        </Container>
      </section>

      <section className="border-y border-white/[0.08] bg-[#08080A]">
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-20">
          <SectionHeading
            description="Jobber is a reliable field engine, but growing operations inevitably hit edge cases across office dispatch, sales, and accounting."
            eyebrow="Operational Reality"
            title="Jobber may run your business. But your workflow is still unique."
          />

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6">
            {operationalReality.map((item) => (
              <article
                className="flex flex-col gap-2 rounded-md border border-white/[0.08] bg-surface-1 p-4 md:gap-3 md:rounded-xl md:p-6"
                key={item.title}
              >
                <div className="flex size-8 items-center justify-center rounded-md border border-white/[0.08] bg-surface-2 text-primary md:size-10 md:rounded-lg">
                  <JobberIcon className="size-5" name={item.icon} />
                </div>
                <h3 className="font-heading text-lg font-semibold leading-[26px] text-white md:text-base md:font-bold md:leading-6">
                  {item.title}
                </h3>
                <p className="text-xs leading-[18px] text-[#C5C7CE] md:text-sm md:leading-[22px] md:text-[#9CA3AF]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-20">
          <SectionHeading
            description="We bridge the gaps with tailored engineering so your team doesn't have to compromise with software limitations."
            eyebrow="Capabilities"
            title="Custom solutions built around the way your business actually works."
          />

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6">
            {capabilities.map((item) => (
              <article
                className="flex flex-col gap-2 rounded-md border border-white/[0.08] bg-surface-1 p-4 md:gap-3 md:rounded-xl md:p-6"
                key={item.title}
              >
                <div className="flex size-8 items-center justify-center rounded-md border border-white/[0.08] bg-surface-2 text-primary md:size-10 md:rounded-lg">
                  <JobberIcon className="size-5" name={item.icon} />
                </div>
                <h3 className="font-heading text-lg font-semibold leading-[26px] text-white md:text-base md:font-bold md:leading-6">
                  {item.title}
                </h3>
                <p className="text-xs leading-[18px] text-[#C5C7CE] md:text-sm md:leading-[22px] md:text-[#9CA3AF]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.08] bg-[#08080A]">
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-20">
          <SectionHeading
            description="Examples of custom engineering — not fixed rigid packages."
            descriptionClassName="font-mono text-xs"
            eyebrow="Field-Proven Examples"
            title="Examples of what can be built around Jobber."
          />

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {examples.map((item) => (
              <article
                className="flex flex-col justify-between gap-5 rounded-md border border-white/[0.08] bg-surface-1 p-4 md:rounded-xl md:p-5"
                key={item.title}
              >
                <div className="flex flex-col gap-2 md:gap-3">
                  <div className="flex items-center gap-2 text-primary md:gap-2.5">
                    <JobberIcon className="size-5 shrink-0" name={item.icon} />
                    <h3 className="font-heading text-lg font-semibold leading-[26px] text-white md:text-sm md:font-bold md:leading-5">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-[18px] text-[#C5C7CE] md:text-[#9CA3AF]">
                    {item.description}
                  </p>
                </div>
                <div className="hidden items-center gap-2 border-t border-white/[0.06] pt-3 text-xs text-[#71747E] lg:flex">
                  <JobberIcon className="size-3.5 text-[#9CA3AF]" name={item.detailIcon} />
                  <span>{item.detail}</span>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-white/[0.08]">
        <Container className="flex max-w-7xl flex-col gap-4 py-6 md:gap-8 md:py-12 lg:gap-10 lg:py-16">
          <SectionHeading
            centered
            description="We connect it to the systems your business already relies on every single day."
            eyebrow="Connected Systems"
            title="Jobber is only one part of your operation."
          />

          <div className="grid grid-cols-5 gap-1 rounded-md bg-surface-1 p-2 md:gap-3 lg:gap-4 lg:bg-transparent lg:p-0">
            {systems.map((system) => (
              <article
                className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-md bg-[#08080A] p-2 text-center md:gap-2 md:p-3 lg:min-h-36 lg:gap-3 lg:rounded-xl lg:border lg:border-white/[0.08] lg:bg-surface-1 lg:p-5"
                key={system.name}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-md md:size-10 lg:size-12 lg:rounded-lg ${system.logoClassName}`}
                >
                  <Image
                    alt={system.alt}
                    className="size-full object-contain"
                    height={48}
                    src={system.src}
                    width={48}
                  />
                </div>
                <span className="max-w-full truncate font-mono text-[9px] font-medium tracking-tight text-white min-[360px]:text-[10px] lg:hidden">
                  {system.mobileName}
                </span>
                <span className="hidden font-heading text-sm font-medium text-white lg:block">
                  {system.name}
                </span>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-20">
          <SectionHeading
            description="We handle the technical heavy lifting from architecture to production deployment."
            eyebrow="Simple 3-Step Process"
            title="Tell us what you wish Jobber could do."
          />

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-6 lg:gap-8">
            {processSteps.map((step, index) => (
              <article
                className="flex flex-col gap-2 rounded-md border border-white/[0.08] bg-surface-1 p-4 md:gap-4 md:rounded-xl md:p-6"
                key={step.title}
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white md:size-9 md:rounded-full">
                  {index + 1}
                </div>
                <div className="flex flex-col gap-1 md:gap-2">
                  <h3 className="font-heading text-lg font-semibold leading-[26px] text-white md:text-base md:font-bold md:leading-6">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-[18px] text-[#C5C7CE] md:text-sm md:leading-[22px] md:text-[#9CA3AF]">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto flex max-w-3xl items-start gap-2 rounded-md border border-white/[0.08] border-l-2 border-l-primary bg-surface-1 p-4 md:items-center md:gap-4 md:rounded-lg md:border-l-4 md:p-5">
            <JobberIcon className="mt-0.5 size-[22px] shrink-0 text-primary md:mt-0 md:size-7" name="verified" />
            <p className="text-xs leading-[18px] text-white md:text-sm md:leading-[22px] md:text-[#D1D5DB]">
              Built by <strong className="font-bold text-primary md:font-semibold md:text-white">Cleiton Carvalho</strong>, Founder of Automa Soluct, with hands-on experience building custom solutions around real Jobber operations.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-white/[0.08] bg-[#08080A]">
        <Container className="flex max-w-7xl flex-col gap-6 py-10 md:py-14 lg:gap-12 lg:py-20">
          <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6">
            {faqs.map((faq, index) => (
              <article
                className={`flex flex-col gap-1 rounded-md border border-white/[0.08] bg-surface-1 p-4 md:gap-2 md:rounded-xl md:p-6 ${
                  index === faqs.length - 1 ? "md:col-span-2" : ""
                }`}
                key={faq.question}
              >
                <h3 className="font-heading text-sm font-semibold leading-5 text-white md:text-base md:font-bold md:leading-6">
                  {faq.question}
                </h3>
                <p className="text-sm leading-[22px] text-[#C5C7CE] md:text-[#9CA3AF]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section id="assessment-form">
        <Container className="max-w-7xl py-10 md:py-14 lg:py-20">
          <div className="mx-auto max-w-[800px]">
            <div className="mb-6 flex flex-col items-center gap-1.5 text-center md:mb-8">
              <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-primary md:text-xs">
                Get Started
              </span>
              <h2 className="font-heading text-[28px] font-semibold leading-9 tracking-[-0.02em] text-white md:text-3xl md:font-bold md:leading-10">
                What do you wish Jobber could do?
              </h2>
              <p className="text-sm leading-[22px] text-[#9CA3AF]">
                Tell us what is slowing your team down, what system needs to
                connect, or what process you want to improve.
              </p>
            </div>

            <AssessmentForm />
          </div>
        </Container>
      </section>
    </div>
  );
}
