import type { Metadata } from "next";
import type { ReactNode } from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog Admin", robots: { index: false, follow: false, noarchive: true } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-w-0" id="blog-admin">{children}</div>;
}
