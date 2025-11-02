import type { Metadata } from "next";
import { CartProvider } from "@/contexts/cart-context";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { StoreFooter } from "./_components/store-footer";
import { StoreHeader } from "./_components/store-header";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store",
  });
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <main className="flex-1">{children}</main>
        <StoreFooter />
      </div>
    </CartProvider>
  );
}
