import type { Metadata } from "next";
import { FeaturedProducts } from "@/components/store/featured-products";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store",
  });
}

export default async function StorePage() {
  return (
    <main className="min-h-screen">
      <FeaturedProducts />
    </main>
  );
}
