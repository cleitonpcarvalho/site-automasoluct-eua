import {
  LegalEmailLink,
  LegalList,
  LegalPageContent,
  LegalSection,
} from "@/components/sections/legal/LegalPageContent";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Terms of Use | Automa Soluct",
  description:
    "Review the terms governing use of the Automa Soluct website and communications with Carvalho Technologies LLC.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPageContent
      effectiveDate="October 12, 2026"
      subtitle="Terms governing the use of this website and communications with Automa Soluct."
      title="Terms of Use"
    >
      <LegalSection title="Acceptance of These Terms">
        <p>
          These Terms of Use govern your access to and use of this website,
          which is operated by Carvalho Technologies LLC under the Automa
          Soluct name. By using the website, you agree to these Terms. If you do
          not agree, please do not use the website.
        </p>
      </LegalSection>

      <LegalSection title="Website Use and Informational Purpose">
        <p>
          This website provides general information about Automa Soluct, its
          capabilities, and the types of automation, integration, and custom
          software services it may offer. Website content is provided for
          general informational purposes and is not a binding offer, proposal,
          technical specification, or professional recommendation for a
          particular business.
        </p>
        <p>
          We may update, correct, suspend, or remove website content or
          functionality at any time. We do not guarantee that every service or
          project request will be accepted.
        </p>
      </LegalSection>

      <LegalSection title="No Automatic Client Relationship">
        <p>
          Submitting a form, sending an email, or sending an SMS does not create
          a client, contractor, partnership, fiduciary, or other professional
          relationship.
        </p>
        <p>
          A relationship only begins when both parties agree to separate
          written commercial terms, proposal, statement of work, or contract.
          Until then, communications are preliminary and may be used only to
          evaluate a possible engagement.
        </p>
      </LegalSection>

      <LegalSection title="Proposals and Paid Engagements">
        <p>
          Any paid engagement is governed by the separate proposal, statement
          of work, contract, order, or other written commercial terms accepted
          by the parties. If those terms conflict with these website Terms, the
          separate written terms control for that engagement.
        </p>
        <p>
          Project scope, pricing, schedules, deliverables, support obligations,
          intellectual property rights, warranties, and liability for paid
          services will be addressed in the applicable written agreement.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable Use">
        <p>You agree not to use the website to:</p>
        <LegalList>
          <li>Violate applicable law or the rights of another person.</li>
          <li>
            Submit unlawful, fraudulent, misleading, abusive, or malicious
            content.
          </li>
          <li>
            Attempt to gain unauthorized access to the website, related
            systems, or information.
          </li>
          <li>
            Introduce malware, interfere with website operation, or test
            vulnerabilities without written authorization.
          </li>
          <li>
            Copy, scrape, or use website content in a way that infringes
            intellectual property rights or unreasonably burdens the website.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Intellectual Property">
        <p>
          Unless otherwise stated, the website content, Automa Soluct branding,
          visual design, original text, original code, graphics, and other
          original materials are owned by Carvalho Technologies LLC or used
          with permission. These materials are protected by applicable
          intellectual property laws.
        </p>
        <p>
          You may view and use the website for legitimate business evaluation
          and communication. No other license or transfer of ownership is
          granted by your use of the website.
        </p>
      </LegalSection>

      <LegalSection title="Third-Party Platforms and Services">
        <p>
          Automa Soluct may describe or build integrations around third-party
          platforms such as Jobber and other software. References to a
          third-party product do not imply affiliation, endorsement,
          certification, or partnership unless expressly stated elsewhere.
        </p>
        <p>
          Third-party trademarks, platforms, APIs, and services remain the
          property of their respective owners. Their availability, terms,
          security, APIs, and functionality are controlled by those third
          parties and may change independently of Automa Soluct.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer of Warranties">
        <p>
          The website is provided on an “as is” and “as available” basis. To
          the extent permitted by applicable law, Carvalho Technologies LLC
          disclaims warranties regarding the website, whether express,
          implied, or statutory, including implied warranties of
          merchantability, fitness for a particular purpose, and
          non-infringement.
        </p>
        <p>
          We do not promise that the website will always be uninterrupted,
          error-free, secure, current, or suitable for every purpose. Any
          project-specific commitments must appear in a separate written
          agreement.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, Carvalho
          Technologies LLC and its owners, personnel, and representatives will
          not be liable for indirect, incidental, special, consequential, or
          exemplary damages arising solely from use of, or inability to use,
          this website, including loss of profits, data, business opportunity,
          or goodwill.
        </p>
        <p>
          Liability connected with paid services is governed by the applicable
          written commercial agreement. Nothing in these Terms excludes or
          limits liability that cannot lawfully be excluded or limited.
        </p>
      </LegalSection>

      <LegalSection title="Changes to the Website or These Terms">
        <p>
          We may modify the website or these Terms from time to time. Updated
          Terms become effective when posted with a revised effective date.
          Continued use of the website after an update constitutes acceptance
          of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="Governing Law">
        <p>
          These Terms are governed by the laws applicable to Carvalho
          Technologies LLC in the State of Wyoming, United States, without
          regard to conflict-of-law principles, unless another law must apply.
        </p>
      </LegalSection>

      <LegalSection title="Severability">
        <p>
          If any provision of these Terms is found unenforceable, that
          provision will be applied to the greatest extent permitted, and the
          remaining provisions will continue in effect.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
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
