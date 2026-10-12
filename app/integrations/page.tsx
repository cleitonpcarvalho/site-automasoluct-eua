import type { Metadata } from "next";

import { IntegrationsPageContent } from "@/components/sections/integrations/IntegrationsPageContent";

export const metadata: Metadata = {
  title: "Custom Jobber Integrations",
  description:
    "Connect Jobber to accounting, cloud storage, field documentation, CRM, and custom systems with integrations built around your workflow.",
};

export default function IntegrationsPage() {
  return <IntegrationsPageContent />;
}
