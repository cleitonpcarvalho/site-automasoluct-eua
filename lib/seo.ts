import type { Metadata } from "next";

export const SITE_ORIGIN = "https://automasoluct.com";
export const SITE_NAME = "Automa Soluct";

export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";
export const DEFAULT_OG_IMAGE_URL = new URL(
  DEFAULT_OG_IMAGE_PATH,
  SITE_ORIGIN,
).toString();
export const DEFAULT_OG_IMAGE_WIDTH = 1731;
export const DEFAULT_OG_IMAGE_HEIGHT = 909;

type CreatePageMetadataOptions = {
  description: string;
  imagePath?: string;
  path: string;
  title: string;
};

export function createPageMetadata({
  description,
  imagePath = DEFAULT_OG_IMAGE_PATH,
  path,
  title,
}: CreatePageMetadataOptions): Metadata {
  const canonicalUrl = new URL(path, SITE_ORIGIN).toString();
  const imageUrl = new URL(imagePath, SITE_ORIGIN).toString();
  const image = {
    url: imageUrl,
    alt: SITE_NAME,
    type: "image/png",
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
  };

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
