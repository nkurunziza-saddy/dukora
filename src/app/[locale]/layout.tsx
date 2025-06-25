import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "@/components/providers/client-body";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/providers/theme-provider";
import SidebarContainer from "@/components/providers/sidebar-container";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist",
  display: "swap",
  preload: true,
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "quantra",
  description: "inventory",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning className="antialiased">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClientBody>
              <SidebarContainer>
                {children}
                <Toaster />
              </SidebarContainer>
            </ClientBody>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
