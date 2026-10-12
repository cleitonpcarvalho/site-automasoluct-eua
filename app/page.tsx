import { HomePageContent } from "@/components/sections/home/HomePageContent";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Custom Jobber Solutions | Automa Soluct",
  description:
    "Custom Jobber automations, integrations, and software for U.S. service businesses that need more from their workflow.",
  path: "/",
});

export default function HomePage() {
  return <HomePageContent />;
}
