import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import ClientBody from "@/components/providers/client-body";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { fontMono, fontSans } from "@/lib/config/fonts";
import {
  MY_HANDLE,
  SITE_DESCRIPTION,
  SITE_HOME_URL,
  SITE_KEYWORDS,
  SITE_NAME,
} from "@/lib/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_HOME_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  openGraph: {
    title: {
      template: `%s | ${SITE_NAME}`,
      default: SITE_NAME,
    },
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: `%s | ${SITE_NAME}`,
      default: SITE_NAME,
    },
    description: SITE_DESCRIPTION,
    creator: `@${MY_HANDLE}`,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: LayoutProps<"/[locale]">) {
  const locale = (await props.params).locale;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={` ${fontSans.variable} ${fontMono.variable}`}>
        <NextIntlClientProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ClientBody>
                {props.children}
                <Toaster />
              </ClientBody>
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
