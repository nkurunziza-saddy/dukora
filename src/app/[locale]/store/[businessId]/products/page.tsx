import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { ProductCategoryFilters } from "@/components/store/product-category-filters";
import { ProductSortSelect } from "@/components/store/product-sort-select";
import { ProductViewToggle } from "@/components/store/product-view-toggle";
import ProductsList from "@/components/store/products-list";
import { StoreSearch } from "@/components/store/store-search";
import { Skeleton } from "@/components/ui/skeleton";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.products",
  });
}

function ProductsPageLoading() {
  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)] ">
      <div className="pgtx ">
        <div className="mb-8">
          <Skeleton className="h-8 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div className="flex-1 max-w-sm">
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div className="bg-background p-4" key={`product-skeleton-${i}`}>
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsListLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div className="bg-background p-4" key={`product-skeleton-${i}`}>
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function ProductsContent({
  searchParams,
  businessId,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  businessId: string;
}) {
  const t = await getTranslations("store");

  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)] ">
      <div className="pgtx ">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
            {t("allProducts")}
          </h1>
          <p className="text-sm text-text-secondary text-pretty">
            {t("browseAllProducts")}
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div className="flex-1 max-w-sm">
              <StoreSearch />
            </div>

            <div className="flex gap-2">
              <ProductSortSelect />

              <ProductViewToggle />
            </div>
          </div>

          <ProductCategoryFilters businessId={businessId} />
        </div>

        <Suspense fallback={<ProductsListLoading />}>
          <ProductsList businessId={businessId} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

export default async function ProductsPage(
  props: PageProps<"/[locale]/store/[businessId]/products">,
) {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductsContent
        businessId={(await props.params).businessId}
        searchParams={await props.searchParams}
      />
    </Suspense>
  );
}
