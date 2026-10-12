import { JobberAutomationContent } from "@/components/sections/jobber/JobberAutomationContent";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Custom Jobber Automation | Automa Soluct",
  description:
    "Custom Jobber automation and workflow solutions for service businesses that need more flexibility, integrations, and operational control.",
  path: "/jobber-automation",
});

export default function JobberAutomationPage() {
  return <JobberAutomationContent />;
}
