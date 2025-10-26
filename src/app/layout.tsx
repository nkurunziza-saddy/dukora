import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { fontMono, fontSans } from "@/lib/config/fonts";
import { constructMetadata } from "@/lib/config/metadata";
import ClientBody from "@/components/providers/client-body";

export const metadata = constructMetadata({
  canonicalUrl: "/",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={` ${fontSans.variable} ${fontMono.variable} `}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientBody>{children}</ClientBody>
          <Toaster />
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
