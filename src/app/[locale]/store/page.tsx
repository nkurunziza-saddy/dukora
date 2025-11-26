import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import StoreCard from "@/components/store/store-card";
import { Skeleton } from "@/components/ui/skeleton";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import {
  getFrequentBusinesses,
  getPopularBusinesses,
  getRecentBusinesses,
} from "@/server/actions/business/business-actions";

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

async function StoreLists() {
  const t = await getTranslations("Store.Page");
  const [popularRes, recentRes, frequentRes] = await Promise.all([
    getPopularBusinesses(4),
    getRecentBusinesses(4),
    getFrequentBusinesses(4),
  ]);

  const popularStores = popularRes.data || [];
  const recentStores = recentRes.data || [];
  const frequentStores = frequentRes.data || [];

  return (
    <div className="space-y-16 pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]">
      {popularStores.length > 0 && (
        <section>
          <div className="pgtx">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-medium text-foreground mb-4 text-balance">
                Popular Stores
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
              {popularStores.map((store) => (
                <StoreCard business={store} key={store.id} />
              ))}
            </div>
          </div>
        </section>
      )}

      {frequentStores.length > 0 && (
        <section>
          <div className="pgtx">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-medium text-foreground mb-4 text-balance">
                Frequently Visited Stores
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
              {frequentStores.map((store) => (
                <StoreCard business={store} key={store.id} />
              ))}
            </div>
          </div>
        </section>
      )}

      {recentStores.length > 0 && (
        <section>
          <div className="pgtx">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-medium text-foreground mb-4 text-balance">
                Recently Visited Stores
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
              {recentStores.map((store) => (
                <StoreCard business={store} key={store.id} />
              ))}
            </div>
          </div>
        </section>
      )}

      {popularStores.length === 0 &&
        recentStores.length === 0 &&
        frequentStores.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t("noStoresFound")}</p>
          </div>
        )}
    </div>
  );
}

export default async function StorePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<FeaturedProductsLoading />}>
        <StoreLists />
      </Suspense>
    </main>
  );
}
