"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/forms/TurnstileWidget";
import { createAssessmentPayload, getAssessmentValidationError, submitAssessment } from "@/lib/assessment-webhook";

import { ContactIcon } from "./ContactIcon";
import styles from "./ContactAssessmentForm.module.css";

const budgetOptions = [
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
] as const;

const fieldClassName =
  "h-11 w-full rounded-lg border border-border-subtle bg-[#08080A] px-3.5 text-base text-white outline-none transition-colors placeholder:text-text-low focus:border-primary focus:ring-1 focus:ring-primary";

type TextFieldProps = {
  autoComplete?: string;
  id: string;
  label: string;
  placeholder: string;
  type?: "email" | "tel" | "text";
};

function TextField({
  autoComplete,
  id,
  label,
  placeholder,
  type = "text",
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      <label className="text-sm font-semibold text-white md:font-medium" htmlFor={id}>
        {label} <span className="text-primary-soft">*</span>
      </label>
      <input
        autoComplete={autoComplete}
        className={fieldClassName}
        id={id}
        name={id}
        placeholder={placeholder}
        required
        type={type}
      />
    </div>
  );
}

export function ContactAssessmentForm({ compactVerification = false }: { compactVerification?: boolean }) {
  const [selectedBudget, setSelectedBudget] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const successRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  useEffect(() => {
    if (submitted) {
      successRef.current?.focus();
    }
  }, [submitted]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = createAssessmentPayload(formData, window.location.href, turnstileToken);
    const validationError = getAssessmentValidationError(payload);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      await submitAssessment(payload);
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
    <div className={styles.container}>
      {submitted ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg bg-surface-2 p-6 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-soft md:min-h-72 md:border md:border-border-subtle md:p-12"
          ref={successRef}
          role="status"
          tabIndex={-1}
        >
          <div className="mb-1 flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary-soft">
            <ContactIcon className="size-7" name="check" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-white md:text-2xl md:font-bold">
            Assessment Request Received
          </h3>
          <p className="max-w-md text-sm leading-[22px] text-text-medium">
            We’ve received your request and will review the workflow and information you provided.
          </p>
        </div>
      ) : (
        <form
          aria-label="Request a free assessment"
          className="flex flex-col gap-4"
          onChangeCapture={() => { if (submitError) setSubmitError(""); }}
          onInvalidCapture={() => setSubmitError("Complete all required fields and enter a valid business email before sending.")}
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              autoComplete="name"
              id="fullName"
              label="Full Name"
              placeholder="John Miller"
            />
            <TextField
              autoComplete="organization"
              id="businessName"
              label="Business Name"
              placeholder="Miller Heating & Air"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              autoComplete="email"
              id="businessEmail"
              label="Business Email"
              placeholder="john@millerhvac.com"
              type="email"
            />
            <TextField
              autoComplete="tel"
              id="phoneNumber"
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              type="tel"
            />
          </div>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="text-sm font-semibold text-white md:font-medium">
              Estimated Project Budget <span className="text-primary-soft">*</span>
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {budgetOptions.map((budget) => {
                const selected = selectedBudget === budget;

                return (
                  <label
                    className={[
                      "flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg border p-2.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-soft",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border-subtle bg-surface-2 hover:border-border-strong",
                    ].join(" ")}
                    key={budget}
                  >
                    <input
                      checked={selected}
                      className="sr-only"
                      name="budget"
                      onChange={() => setSelectedBudget(budget)}
                      required
                      type="radio"
                      value={budget}
                    />
                    <span className="text-xs font-semibold leading-4 text-text-medium">
                      {budget}
                    </span>
                    <span
                      aria-hidden="true"
                      className={[
                        "flex size-3.5 shrink-0 items-center justify-center rounded-full border md:size-4",
                        selected
                          ? "border-primary"
                          : "border-border-strong bg-[#08080A]",
                      ].join(" ")}
                    >
                      {selected ? <span className="size-2 rounded-full bg-primary" /> : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5 md:gap-2">
            <label className="text-sm font-semibold leading-5 text-white md:font-medium" htmlFor="workflow">
              What would you like to automate, integrate, or improve in your Jobber workflow?{" "}
              <span className="text-primary-soft">*</span>
            </label>
            <textarea
              className="min-h-28 w-full resize-y rounded-lg border border-border-subtle bg-[#08080A] p-3.5 text-base leading-6 text-white outline-none transition-colors placeholder:text-text-low focus:border-primary focus:ring-1 focus:ring-primary"
              id="workflow"
              name="workflow"
              placeholder="Tell us what happens today, what your team is doing manually, what systems are involved, and what you would like to happen instead."
              required
              rows={4}
            />
          </div>

          <TurnstileWidget
            onTokenChange={setTurnstileToken}
            ref={turnstileRef}
            size={compactVerification ? "normal" : undefined}
          />

          <div className="flex flex-col items-center justify-between gap-3 md:flex-row md:gap-4">
            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-active md:w-auto md:rounded"
              disabled={isSubmitting || !turnstileToken}
              type="submit"
            >
              <span aria-atomic="true" aria-live="polite">
                {isSubmitting ? "Sending..." : "Request Free Assessment"}
              </span>
              {!isSubmitting ? (
                <ContactIcon className="size-[18px]" name="arrow-right" />
              ) : null}
            </button>
            <p className="text-center text-xs leading-[18px] text-text-low md:text-right">
              We’ll review your request before reaching out.
            </p>
          </div>
          {submitError ? (
            <p
              aria-atomic="true"
              className="text-center text-sm text-red-300 md:text-left"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
