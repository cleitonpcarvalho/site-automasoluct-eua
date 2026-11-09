import { ContactAssessmentForm } from "../contact/ContactAssessmentForm";

import { JobberIcon } from "./JobberIcon";

export function AssessmentForm() {
  return (
    <>
      <ContactAssessmentForm sourcePage="/jobber-automation" />

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
