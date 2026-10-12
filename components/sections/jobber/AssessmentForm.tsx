"use client";

import { useRef, useState, type FormEvent } from "react";

import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/forms/TurnstileWidget";
import { submitAssessment } from "@/lib/assessment-webhook";

import { JobberIcon } from "./JobberIcon";

const budgetOptions = [
  { label: "$1,000 – $2,500", value: "1000-2500" },
  { label: "$2,500 – $5,000", value: "2500-5000" },
  { label: "$5,000 – $10,000", value: "5000-10000" },
  { label: "$10,000+", value: "10000+" },
] as const;

const fieldClassName =
  "h-10 w-full rounded-md border border-white/[0.08] bg-[#08080A] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-text-low focus:border-primary md:rounded-lg";

export function AssessmentForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitted || isSubmitting || !turnstileToken) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    setSubmitError("");
    setIsSubmitting(true);

    try {
      await submitAssessment({
        fullName: String(formData.get("fullName") ?? "").trim(),
        businessName: String(formData.get("businessName") ?? "").trim(),
        businessEmail: String(formData.get("businessEmail") ?? "").trim(),
        phoneNumber: String(formData.get("phoneNumber") ?? ""),
        businessDescription: "Not provided on this form.",
        estimatedProjectBudget: String(formData.get("budget") ?? ""),
        systemsInvolved: ["Jobber"],
        jobberWorkflowRequest: String(
          formData.get("workflowNeeds") ?? "",
        ).trim(),
        sourcePage: "/jobber-automation",
        turnstileToken,
      });
      turnstileRef.current?.reset();
      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="rounded-lg border border-white/[0.08] bg-surface-1 p-6 md:rounded-2xl md:p-8">
        <form
          aria-labelledby="jobber-assessment-heading"
          className="flex flex-col gap-4 md:gap-5"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#C5C7CE]" htmlFor="full-name">
                Full Name
              </label>
              <input
                autoComplete="name"
                className={fieldClassName}
                id="full-name"
                name="fullName"
                placeholder="e.g. John Miller"
                required
                type="text"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#C5C7CE]" htmlFor="business-name">
                Business Name
              </label>
              <input
                autoComplete="organization"
                className={fieldClassName}
                id="business-name"
                name="businessName"
                placeholder="e.g. Miller Heating & Air"
                required
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#C5C7CE]" htmlFor="business-email">
                Business Email
              </label>
              <input
                autoComplete="email"
                className={fieldClassName}
                id="business-email"
                name="businessEmail"
                placeholder="john@millerhvac.com"
                required
                type="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#C5C7CE]" htmlFor="phone-number">
                Phone Number
              </label>
              <input
                autoComplete="tel"
                className={fieldClassName}
                id="phone-number"
                name="phoneNumber"
                placeholder="+1 (555) 000-0000"
                required
                type="tel"
              />
            </div>
          </div>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-xs font-medium text-[#C5C7CE]">
              Estimated Project Budget
            </legend>
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-3">
              {budgetOptions.map((option, index) => (
                <label
                  className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-white/[0.08] bg-[#08080A] p-2 transition-colors hover:border-white/[0.15] has-[:checked]:border-primary has-[:checked]:bg-blue-500/10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-soft md:rounded-lg md:p-3"
                  key={option.value}
                >
                  <input
                    className="size-3.5 shrink-0 accent-primary"
                    defaultChecked={index === 0}
                    name="budget"
                    type="radio"
                    value={option.value}
                  />
                  <span className="font-mono text-[10px] font-medium leading-4 text-white md:text-xs">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#C5C7CE]" htmlFor="workflow-needs">
              What would you like to automate or improve in your Jobber workflow?
            </label>
            <textarea
              className="min-h-28 w-full resize-y rounded-md border border-white/[0.08] bg-[#08080A] px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-text-low focus:border-primary md:rounded-lg"
              id="workflow-needs"
              name="workflowNeeds"
              placeholder="Describe your manual bottleneck, required integration, or missing feature..."
              required
              rows={4}
            />
          </div>

          <TurnstileWidget
            onTokenChange={setTurnstileToken}
            ref={turnstileRef}
          />

          <button
            aria-disabled={submitted || isSubmitting || !turnstileToken}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft aria-disabled:cursor-default aria-disabled:bg-primary-active md:min-h-12 md:rounded-lg"
            disabled={submitted || isSubmitting || !turnstileToken}
            type="submit"
          >
            <span aria-atomic="true" aria-live="polite">
              {submitted
                ? "Request Received ✓"
                : isSubmitting
                  ? "Sending..."
                  : "Request Free Assessment"}
            </span>
            {!submitted && !isSubmitting ? <JobberIcon name="send" /> : null}
          </button>
          {submitError ? (
            <p
              aria-atomic="true"
              className="text-center text-sm text-red-300"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}
        </form>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 text-xs text-[#9CA3AF] sm:flex-row sm:gap-6">
        <a
          className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          href="sms:+13076224973"
        >
          <JobberIcon className="size-4 text-primary" name="sms" />
          <span>Text an engineer: +1 (307) 622-4973</span>
        </a>
        <span className="hidden text-text-low sm:inline">•</span>
        <a
          className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          href="mailto:hello@automasoluct.com"
        >
          <JobberIcon className="size-4 text-primary" name="mail" />
          <span>Email: hello@automasoluct.com</span>
        </a>
      </div>
    </>
  );
}
