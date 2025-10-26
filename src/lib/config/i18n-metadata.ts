import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_HOME_URL } from "@/lib/config/site";

export interface I18nMetadataOptions {
  pageKey: string;
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export async function constructI18nMetadata({
  pageKey,
  image,
  canonicalUrl,
  noIndex,
}: I18nMetadataOptions): Promise<Metadata> {
  const t = await getTranslations("metadata");

  const siteName = t("siteName");
  const pageTitle = t(`pages.${pageKey}.title`);
  const pageDescription = t(`pages.${pageKey}.description`);

  const ogTitle = `${pageTitle} | ${siteName}`;
  const pageImage = image || `${SITE_HOME_URL}/og.jpeg`;

  return {
    title: pageTitle,
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

export async function getI18nSiteMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  const siteName = t("siteName");
  const siteDescription = t("siteDescription");

  return {
    metadataBase: new URL(SITE_HOME_URL),
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: siteDescription,
    openGraph: {
      title: {
        template: `%s | ${siteName}`,
        default: siteName,
      },
      description: siteDescription,
      siteName: siteName,
      type: "website",
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: {
        template: `%s | ${siteName}`,
        default: siteName,
      },
      description: siteDescription,
    },
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
