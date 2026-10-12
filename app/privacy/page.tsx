import {
  LegalEmailLink,
  LegalList,
  LegalPageContent,
  LegalSection,
} from "@/components/sections/legal/LegalPageContent";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy | Automa Soluct",
  description:
    "Learn how Automa Soluct collects, uses, stores, and protects information submitted through this website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPageContent
      effectiveDate="October 12, 2026"
      subtitle="How Automa Soluct collects, uses, and protects information submitted through this website."
      title="Privacy Policy"
    >
      <LegalSection title="Overview">
        <p>
          This Privacy Policy explains how Carvalho Technologies LLC, operating
          as Automa Soluct, handles personal information collected through this
          website and related communications. It applies when you submit a
          website form, send an email or SMS, or otherwise contact us about our
          services.
        </p>
      </LegalSection>

      <LegalSection title="Information You Provide">
        <p>
          We may collect information that you voluntarily provide when you ask
          a question, request an assessment, or discuss a potential project.
          Depending on what you submit, this may include:
        </p>
        <LegalList>
          <li>Your name and company or business name.</li>
          <li>Your email address and telephone number.</li>
          <li>
            A description of your project, workflow, operational challenge, or
            requested service.
          </li>
          <li>Your estimated budget or project range.</li>
          <li>
            Information about Jobber and other systems, platforms, or software
            involved in your workflow.
          </li>
          <li>Any other information you choose to include.</li>
        </LegalList>
        <p>
          Please avoid sending sensitive personal information that is not
          necessary for us to understand your request.
        </p>
      </LegalSection>

      <LegalSection title="How We Use Information">
        <p>We may use collected information to:</p>
        <LegalList>
          <li>Respond to questions and service requests.</li>
          <li>Evaluate project needs, feasibility, and fit.</li>
          <li>Contact you about the request you submitted.</li>
          <li>Prepare proposals, estimates, or project documentation.</li>
          <li>Maintain appropriate operational and business records.</li>
          <li>Improve customer service, website security, and reliability.</li>
          <li>
            Protect our rights, investigate misuse, and comply with applicable
            legal obligations.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Technical Information">
        <p>
          When you visit the website, limited technical information may be
          collected automatically by the website, hosting environment, or
          infrastructure providers. When applicable, this may include basic
          server logs, IP address, browser or device information, referring
          page, requested pages, timestamps, and diagnostic or error data.
        </p>
        <p>
          This information may be used to deliver the website, diagnose
          technical issues, prevent abuse, and maintain security.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and Advertising Trackers">
        <p>
          This website currently does not intentionally use third-party
          advertising trackers, marketing pixels, or behavioral advertising
          technologies. If these practices change, this Privacy Policy may be
          updated to describe the relevant technology and choices.
        </p>
      </LegalSection>

      <LegalSection title="How We Share Information">
        <p>
          We do not sell personal information. We may share information only
          when reasonably necessary for business operations, service delivery,
          security, or legal compliance, including with:
        </p>
        <LegalList>
          <li>Service providers supporting our business operations.</li>
          <li>Website hosting and infrastructure providers.</li>
          <li>Email and communication service providers.</li>
          <li>
            Automation or integration platforms involved in evaluating or
            delivering a requested service.
          </li>
          <li>
            Legal authorities or other parties when disclosure is required by
            law or reasonably necessary to protect rights and safety.
          </li>
        </LegalList>
        <p>
          Providers receive information only to the extent reasonably needed
          for the relevant purpose.
        </p>
      </LegalSection>

      <LegalSection title="Data Retention">
        <p>
          Personal information is retained only for as long as reasonably
          necessary for the purposes described in this policy, business
          recordkeeping, dispute resolution, security, and legal obligations.
          Retention periods may vary depending on the nature of the information
          and the reason it was collected.
        </p>
      </LegalSection>

      <LegalSection title="Data Security">
        <p>
          We use reasonable administrative, technical, and organizational
          safeguards designed to protect personal information. However, no
          method of transmission or storage can be guaranteed to be completely
          secure.
        </p>
      </LegalSection>

      <LegalSection title="Your Privacy Choices">
        <p>
          You may contact us to request access to, correction of, or deletion
          of personal information associated with you, or to ask questions
          about how your information is handled. Requests may be subject to
          identity verification, applicable law, and legitimate business or
          recordkeeping needs.
        </p>
        <p>
          Send privacy requests to <LegalEmailLink />.
        </p>
        <p>
          Depending on your location, applicable privacy laws may provide
          additional rights.
        </p>
      </LegalSection>

      <LegalSection title="International Processing">
        <p>
          Automa Soluct may serve business users in the United States, Brazil,
          Europe, and other locations. Information may be processed or stored
          in countries other than the country where you are located. Privacy
          and data protection laws may differ between jurisdictions.
        </p>
      </LegalSection>

      <LegalSection title="Children’s Privacy">
        <p>
          This website is intended for business users and is not directed to
          children. We do not knowingly solicit personal information from
          children through this website.
        </p>
      </LegalSection>

      <LegalSection title="Changes to This Policy">
        <p>
          We may update this Privacy Policy to reflect changes in the website,
          our services, or applicable requirements. The effective date at the
          top of this page identifies the current version.
        </p>
      </LegalSection>

      <LegalSection title="Privacy Contact">
        <address className="flex flex-col not-italic">
          <span>Carvalho Technologies LLC</span>
          <span>Automa Soluct</span>
          <span className="mt-1 flex flex-wrap gap-1">
            <span>Email:</span> <LegalEmailLink />
          </span>
        </address>
      </LegalSection>
    </LegalPageContent>
  );
}
