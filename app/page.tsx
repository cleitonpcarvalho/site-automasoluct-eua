import { RecentBlogPosts } from "@/components/blog/RecentBlogPosts";
import { HomePageContent } from "@/components/sections/home/HomePageContent";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Custom Jobber Solutions | Automa Soluct",
  description:
    "Custom Jobber automations, integrations, and software for U.S. service businesses that need more from their workflow.",
  path: "/",
});

export default function HomePage() {
  return (
    <HomePageContent recentBlogPosts={
      <RecentBlogPosts
        count={4}
        layout="full"
        subtitle="Practical insights on Jobber, integrations and business automation."
      />
    } />
  );
}
