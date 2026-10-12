import { ContactPageContent } from "@/components/sections/contact/ContactPageContent";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact & Free Assessment | Automa Soluct",
  description:
    "Tell us what you need Jobber to do. Request a free assessment for custom automation, integration, or workflow improvements.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactPageContent />;
}
