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
    <div>
      <div className="bg-background border-b">
        <div className="container py-6">
          <Skeleton className="h-8 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function CheckoutContent() {
  const t = await getTranslations("store.checkout");
  return (
    <div>
      <div className="bg-background border-b">
        <div className="container py-6">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      <CheckoutView />
    </div>
  );
}

export default async function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
