"use client";

import { FormEvent, useState } from "react";

import { ContactIcon } from "./ContactIcon";

const budgetOptions = [
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
] as const;

const systemOptions = [
  "Jobber",
  "Xero",
  "QuickBooks",
  "Google Workspace",
  "CompanyCam",
  "HighLevel",
  "CRM",
  "Custom API",
  "Internal System",
  "Other",
] as const;

const fieldClassName =
  "h-10 w-full rounded border border-transparent bg-surface-2 px-4 text-sm text-white outline-none transition-colors placeholder:text-text-low focus:border-primary focus:ring-1 focus:ring-primary md:h-11 md:border-border-subtle md:bg-[#08080A]";

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
        {label} <span className="text-primary">*</span>
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

export function ContactAssessmentForm() {
  const [selectedBudget, setSelectedBudget] = useState<string>("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleSystem(system: string) {
    setSelectedSystems((current) =>
      current.includes(system)
        ? current.filter((item) => item !== system)
        : [...current, system],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col gap-6 md:rounded-lg md:border md:border-border-subtle md:bg-surface-1 md:p-8 lg:p-12">
      <div className="flex flex-col gap-1.5 md:mb-0 md:border-b md:border-border-subtle md:pb-8">
        <h2 className="font-heading text-[22px] font-semibold leading-[30px] tracking-[-0.015em] text-white md:text-2xl md:font-bold">
          Tell us about your workflow.
        </h2>
        <p className="text-xs leading-[18px] text-text-medium md:text-sm md:text-text-low">
          Complete technical scope request. Direct engineer evaluation.
        </p>
      </div>

      {submitted ? (
        <div
          aria-live="polite"
          className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg bg-surface-2 p-6 text-center md:min-h-72 md:border md:border-border-subtle md:p-12"
          role="status"
        >
          <div className="mb-1 flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
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
        <form className="flex flex-col gap-4 md:gap-7" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
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

          <TextField
            autoComplete="organization-title"
            id="businessActivity"
            label="What does your business do?"
            placeholder="HVAC, cleaning, landscaping, plumbing, roofing, electrical, etc."
          />

          <fieldset className="flex flex-col gap-2.5">
            <legend className="text-sm font-semibold text-white md:font-medium">
              Estimated Project Budget <span className="text-primary">*</span>
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2 md:mt-0 md:grid-cols-4 md:gap-3">
              {budgetOptions.map((budget) => {
                const selected = selectedBudget === budget;

                return (
                  <label
                    className={[
                      "flex min-h-12 cursor-pointer items-center justify-between gap-2 rounded border p-2 transition-colors md:p-3.5",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-surface-2 hover:border-border-strong md:border-border-subtle",
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
                    <span className="text-xs font-semibold leading-4 text-text-medium md:text-sm md:font-medium">
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

          <fieldset className="relative flex flex-col gap-2">
            <legend className="text-sm font-semibold text-white md:font-medium">
              Which systems are involved?{" "}
              <span className="text-xs font-normal text-text-low">(Optional)</span>
            </legend>
            <span className="text-xs text-text-low sm:absolute sm:right-0 sm:top-0">
              Select any that apply to your current workflow.
            </span>
            <div className="flex flex-wrap gap-1 pt-1 md:gap-2">
              {systemOptions.map((system) => {
                const selected = selectedSystems.includes(system);

                return (
                  <button
                    aria-pressed={selected}
                    className={[
                      "rounded border px-2 py-1 font-mono text-xs transition-colors md:px-3.5 md:py-1.5",
                      selected
                        ? "border-primary bg-primary text-white"
                        : "border-transparent bg-surface-2 text-text-medium hover:border-border-strong md:border-border-subtle",
                    ].join(" ")}
                    key={system}
                    onClick={() => toggleSystem(system)}
                    type="button"
                  >
                    {system}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5 md:gap-2">
            <label className="text-sm font-semibold leading-5 text-white md:font-medium" htmlFor="workflow">
              What would you like to automate, integrate, or improve in your Jobber workflow?{" "}
              <span className="text-primary">*</span>
            </label>
            <textarea
              className="min-h-36 w-full resize-y rounded border border-transparent bg-surface-2 p-4 text-sm leading-[22px] text-white outline-none transition-colors placeholder:text-text-low focus:border-primary focus:ring-1 focus:ring-primary md:min-h-40 md:border-border-subtle md:bg-[#08080A]"
              id="workflow"
              name="workflow"
              placeholder="Tell us what happens today, what your team is doing manually, what systems are involved, and what you would like to happen instead."
              required
              rows={5}
            />
          </div>

          <div className="flex flex-col items-center justify-between gap-2 pt-2 md:flex-row md:gap-4 md:border-t md:border-border-subtle md:pt-4">
            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:bg-primary-active md:w-auto md:rounded"
              type="submit"
            >
              Request Free Assessment
              <ContactIcon className="size-[18px]" name="arrow-right" />
            </button>
            <p className="text-center text-xs leading-[18px] text-text-low md:text-right">
              We’ll review your request before reaching out.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
