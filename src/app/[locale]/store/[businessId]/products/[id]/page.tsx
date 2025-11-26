import type { Metadata } from "next";
import { Suspense } from "react";

import StoreProductDetails from "@/components/store/product-details";
import { Skeleton } from "@/components/ui/skeleton";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.product",
  });
}

function ProductLoading() {
  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]">
      <div className="pgtx">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>

          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductPage(
  props: PageProps<"/[locale]/store/[businessId]/products/[id]">
) {
  return (
    <Suspense fallback={<ProductLoading />}>
      <StoreProductDetails
        businessId={(await props.params).businessId}
        productId={(await props.params).id}
      />
    </Suspense>
  );
}
