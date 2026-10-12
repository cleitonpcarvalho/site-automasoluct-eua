import type { Metadata } from "next";

import { ContactPageContent } from "@/components/sections/contact/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact & Free Assessment",
  description:
    "Tell Automa Soluct what you want to automate, integrate, or improve in your Jobber workflow.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
