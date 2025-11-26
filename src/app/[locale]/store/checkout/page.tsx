import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CheckoutSkeleton } from "@/components/skeletons";
import { CheckoutView } from "@/components/store/checkout-view";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.checkout",
  });
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
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutContent />
        </Suspense>
      </div>
    </div>
  );
}
