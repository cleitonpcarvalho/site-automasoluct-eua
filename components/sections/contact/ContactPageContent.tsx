import { Container } from "@/components/layout/Container";

import { ContactAssessmentForm } from "./ContactAssessmentForm";
import { ContactIcon, type ContactIconName } from "./ContactIcon";

const directContacts: readonly {
  title: string;
  value: string;
  action: string;
  href: string;
  icon: ContactIconName;
  actionIcon: ContactIconName;
}[] = [
  {
    title: "SMS / Text Message",
    value: "+1 (307) 622-4973",
    action: "Text Us",
    href: "sms:+13076224973",
    icon: "sms",
    actionIcon: "sms",
  },
  {
    title: "Direct Email",
    value: "hello@automasoluct.com",
    action: "Send an Email",
    href: "mailto:hello@automasoluct.com",
    icon: "mail",
    actionIcon: "send",
  },
] as const;

const nextSteps = [
  {
    number: "01",
    label: "ANALYSIS",
    title: "WE REVIEW THE REQUEST",
    description:
      "We look at the workflow, systems involved, and what you are trying to improve.",
  },
  {
    number: "02",
    label: "ALIGNMENT",
    title: "WE CONTACT YOU",
    description:
      "If the project looks like a fit, we reach out directly to discuss the problem.",
  },
  {
    number: "03",
    label: "EXECUTION",
    title: "WE DEFINE THE NEXT STEP",
    description:
      "Depending on the project, that may be a short conversation, a technical review, or a meeting before a proposal.",
  },
] as const;

export function ContactPageContent() {
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <Container className="flex max-w-7xl flex-col gap-10 py-10 md:gap-14 md:py-14 lg:gap-20 lg:py-16">
        <section className="flex max-w-3xl flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-2 py-1 md:rounded md:border md:border-border-subtle md:px-3">
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-medium md:text-xs">
              Free Assessment
            </span>
          </div>
          <h1 className="font-heading text-[28px] font-bold leading-9 tracking-[-0.02em] text-white md:text-[40px] md:leading-[48px] lg:text-5xl lg:font-extrabold lg:leading-[1.15]">
            Tell us what you need Jobber to do.
          </h1>
          <div className="flex max-w-2xl flex-col gap-1 text-sm leading-[22px] text-text-medium md:text-base md:leading-[26px]">
            <p>
              Describe what is slowing your operation down, what system needs to connect, or what you wish Jobber could handle differently.
            </p>
            <p className="text-text-low">
              We’ll review the problem and determine the most practical way to approach it.
            </p>
          </div>
        </section>

        <section id="assessment-form">
          <ContactAssessmentForm />
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-low md:text-xs">
              PREFER TO CONTACT US DIRECTLY?
            </span>
            <h2 className="font-heading text-[28px] font-semibold leading-9 tracking-[-0.02em] text-white md:text-3xl md:font-bold md:leading-10">
              Start with a quick message.
            </h2>
            <p className="text-sm leading-[22px] text-text-medium">
              For quick questions, SMS is the fastest way to start a conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6">
            {directContacts.map((contact) => (
              <article
                className="flex flex-col justify-between gap-4 rounded-xl bg-surface-1 p-4 md:gap-6 md:rounded-lg md:border md:border-border-subtle md:p-6"
                key={contact.title}
              >
                <div className="flex min-w-0 items-center gap-2 md:gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded bg-surface-2 text-primary md:size-12 md:border md:border-border-subtle">
                    <ContactIcon className="size-5 md:size-6" name={contact.icon} />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <h3 className="text-sm font-semibold text-white md:text-base">{contact.title}</h3>
                    <span className="mt-0.5 truncate font-mono text-xs text-text-medium md:text-text-low">
                      {contact.value}
                    </span>
                  </div>
                </div>
                <a
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-surface-2 px-5 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-surface-hover md:min-h-10 md:rounded md:border md:border-border-subtle md:hover:border-border-strong"
                  href={contact.href}
                >
                  <ContactIcon className="size-4 text-primary" name={contact.actionIcon} />
                  {contact.action}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="font-heading text-[28px] font-semibold leading-9 tracking-[-0.02em] text-white md:text-3xl md:font-bold md:leading-10">
            What happens after you submit?
          </h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-6">
            {nextSteps.map((step) => (
              <article
                className="flex flex-col gap-2 rounded-xl bg-surface-1 p-4 md:gap-3 md:rounded-lg md:border md:border-border-subtle md:p-6"
                key={step.number}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-primary-soft md:text-sm">{step.number}</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-text-low">{step.label}</span>
                </div>
                <h3 className="mt-1 font-heading text-base font-bold tracking-wide text-white md:mt-0">{step.title}</h3>
                <p className="text-sm leading-[22px] text-text-medium md:text-xs md:leading-relaxed">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex items-start gap-2 rounded-xl bg-surface-1 p-4 md:gap-4 md:rounded-lg md:border md:border-border-subtle md:p-6">
          <ContactIcon className="mt-0.5 size-[22px] shrink-0 text-primary md:size-6" name="shield" />
          <p className="text-xs leading-[18px] text-text-medium md:text-sm md:leading-[22px]">
            Automa Soluct is operated by Carvalho Technologies LLC, a U.S.-registered company working with clients in the United States, Brazil, and Europe.
          </p>
        </section>

        <section className="flex flex-col items-center gap-6 rounded-xl bg-surface-1 px-4 py-10 text-center md:rounded-lg md:border md:border-border-subtle md:p-10 lg:p-12">
          <div className="flex max-w-xl flex-col items-center gap-2">
            <h2 className="font-heading text-[28px] font-semibold leading-9 tracking-[-0.02em] text-white md:text-3xl md:font-bold md:leading-10">
              Have a Jobber problem you haven’t been able to solve?
            </h2>
            <p className="text-sm leading-[22px] text-text-medium">
              Send us the workflow. We’ll take a look.
            </p>
          </div>
          <div className="flex w-full max-w-xs flex-col items-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
            <a
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active sm:w-auto md:rounded"
              href="sms:+13076224973"
            >
              <ContactIcon className="size-[18px]" name="sms" />
              Text Us
            </a>
            <a
              className="font-mono text-xs text-text-low transition-colors hover:text-white hover:underline hover:underline-offset-4"
              href="mailto:hello@automasoluct.com"
            >
              hello@automasoluct.com
            </a>
          </div>
        </section>
      </Container>
    </div>
  );
}
