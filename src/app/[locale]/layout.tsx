import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";

import { QueryProvider } from "@/lib/providers/query-provider";

import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: LayoutProps<"/[locale]">) {
  const locale = (await props.params).locale;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  return (
    <NextIntlClientProvider>
      <QueryProvider>{props.children}</QueryProvider>
    </NextIntlClientProvider>
  );
}
