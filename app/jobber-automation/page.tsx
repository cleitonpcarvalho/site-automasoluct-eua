import type { Metadata } from "next";

import { JobberAutomationContent } from "@/components/sections/jobber/JobberAutomationContent";

export const metadata: Metadata = {
  title: "Custom Jobber Automation",
  description:
    "Custom Jobber automation, integrations, and software built around the workflow of U.S. service businesses.",
};

export default function JobberAutomationPage() {
  return <JobberAutomationContent />;
}
