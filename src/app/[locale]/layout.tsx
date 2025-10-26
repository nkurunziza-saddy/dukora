import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ClientBody from "@/components/providers/client-body";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { fontMono, fontSans } from "@/lib/config/fonts";
import { getI18nSiteMetadata } from "@/lib/config/i18n-metadata";
import { MY_HANDLE, SITE_KEYWORDS } from "@/lib/config/site";
import { QueryProvider } from "@/lib/providers/query-provider";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getI18nSiteMetadata();

  return {
    ...metadata,
    keywords: SITE_KEYWORDS,
    twitter: {
      ...metadata.twitter,
      creator: `@${MY_HANDLE}`,
    },
  };
}

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
    <html data-scroll-behavior="smooth" lang={locale} suppressHydrationWarning>
      <body className={` ${fontSans.variable} ${fontMono.variable}`}>
        <NextIntlClientProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              disableTransitionOnChange
              enableSystem
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
