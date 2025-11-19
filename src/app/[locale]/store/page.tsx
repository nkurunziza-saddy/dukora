import type { Metadata } from "next";
import { Suspense } from "react";
import { FeaturedProducts } from "@/components/store/featured-products";
import { Skeleton } from "@/components/ui/skeleton";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store",
  });
}

function FeaturedProductsLoading() {
  return (
    <section
      className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]"
      id="featured-products"
    >
      <div className="pgtx">
        <div className="flex items-center justify-between mb-10">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              className="bg-background p-4"
              key={`featured-product-skeleton-${i}`}
            >
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function StorePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<FeaturedProductsLoading />}>
        <FeaturedProducts />
      </Suspense>
    </main>
  );
}
