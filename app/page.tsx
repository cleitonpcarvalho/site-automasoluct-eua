import { connection } from "next/server";

import { HomePageContent } from "@/components/sections/home/HomePageContent";
import { getBlogService } from "@/lib/blog/service";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Custom Jobber Solutions | Automa Soluct",
  description:
    "Custom Jobber automations, integrations, and software for U.S. service businesses that need more from their workflow.",
  path: "/",
});

export default async function HomePage() {
  await connection();
  const posts = getBlogService().listPublished(1, 4).items;

  return <HomePageContent recentPosts={posts} />;
}
