import { IntegrationsPageContent } from "@/components/sections/integrations/IntegrationsPageContent";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Custom Jobber Integrations | Automa Soluct",
  description:
    "Connect Jobber with accounting, CRM, cloud storage, field documentation, communications, and custom systems through tailored integrations.",
  path: "/integrations",
});

export default function IntegrationsPage() {
  return <IntegrationsPageContent />;
}
