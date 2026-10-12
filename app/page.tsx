import type { Metadata } from "next";

import { HomePageContent } from "@/components/sections/home/HomePageContent";

export const metadata: Metadata = {
  title: "Custom Jobber Solutions",
  description:
    "Custom automations, integrations, and software for U.S. service businesses that need more from their Jobber workflow.",
};

export default function HomePage() {
  return <HomePageContent />;
}
