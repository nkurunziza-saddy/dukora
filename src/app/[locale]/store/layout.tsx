import type { Metadata } from "next";
import { StoreFooter } from "@/components/store/store-footer";
import StoreHeader from "@/components/store/store-header";
import { CartProvider } from "@/contexts/cart-context";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

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
      <div className="">
        <StoreHeader />
        {children}
        <StoreFooter />
      </div>
    </CartProvider>
  );
}
