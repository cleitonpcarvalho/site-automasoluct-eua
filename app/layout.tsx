import type { Metadata, Viewport } from "next";
import {
  Inter,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_ORIGIN,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const defaultDescription =
  "Custom Jobber automations, integrations, and software for U.S. service businesses that need more from their workflow.";
const defaultSocialImage = {
  url: DEFAULT_OG_IMAGE_URL,
  alt: SITE_NAME,
  type: "image/png",
  width: DEFAULT_OG_IMAGE_WIDTH,
  height: DEFAULT_OG_IMAGE_HEIGHT,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Custom Jobber Solutions | Automa Soluct",
    template: `%s | ${siteConfig.name}`,
  },
  description: defaultDescription,
  openGraph: {
    title: "Custom Jobber Solutions | Automa Soluct",
    description: defaultDescription,
    url: SITE_ORIGIN,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [defaultSocialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Jobber Solutions | Automa Soluct",
    description: defaultDescription,
    images: [defaultSocialImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  legalName: siteConfig.legalName,
  url: SITE_ORIGIN,
  email: siteConfig.email,
  telephone: "+1-307-622-4973",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${jetBrainsMono.variable}`}
      >
        <a
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-md bg-white px-4 py-3 text-sm font-semibold text-black shadow-lg transition-transform focus:translate-y-0"
          href="#main-content"
        >
          Skip to main content
        </a>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
          id="organization-json-ld"
          type="application/ld+json"
        />
        <div className="site-shell">
          <Header />
          <main
            className="flex flex-1 scroll-mt-24 flex-col"
            id="main-content"
            tabIndex={-1}
          >
            {children}
          </main>
          <Footer />
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
