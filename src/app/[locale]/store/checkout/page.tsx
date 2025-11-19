import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { CheckoutView } from "@/components/store/checkout-view";
import { Skeleton } from "@/components/ui/skeleton";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.checkout",
  });
}

function CheckoutLoading() {
  return (
    <div className="mb-8 space-y-4">
      <div className="py-6">
        <Skeleton className="h-8 w-1/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function CheckoutContent() {
  const t = await getTranslations("store.checkout");
  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
          {t("title")}
        </h1>
        <p className="text-sm text-text-secondary text-pretty">
          {t("description")}
        </p>
      </div>
      <CheckoutView />
    </>
  );
}

export default async function CheckoutPage() {
  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)] ">
      <div className="pgtx ">
        <Suspense fallback={<CheckoutLoading />}>
          <CheckoutContent />
        </Suspense>
      </div>
    </div>
  );
}
