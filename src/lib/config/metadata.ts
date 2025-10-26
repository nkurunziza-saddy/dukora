import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_HOME_URL, SITE_NAME } from "@/lib/config/site";

export function constructMetadata({
  title,
  description,
  image,
  canonicalUrl,
  noIndex,
}: {
  title: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}): Metadata {
  const ogTitle = `${title} | ${SITE_NAME}`;
  const pageDescription = description || SITE_DESCRIPTION;
  const pageImage = image || `${SITE_HOME_URL}/og.jpeg`;

  return {
    title,
    description: pageDescription,
    openGraph: {
      title: ogTitle,
      description: pageDescription,
      images: [{ url: pageImage, alt: ogTitle }],
      url: canonicalUrl,
    },
    twitter: {
      title: ogTitle,
      description: pageDescription,
      images: [pageImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}
