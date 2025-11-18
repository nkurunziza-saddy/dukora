import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CheckoutView } from "@/components/store/checkout-view";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.checkout",
  });
}

async function CategoryContent({ t }: { t: (key: string) => string }) {
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
  const t = await getTranslations("store.checkout");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryContent t={t} />
    </Suspense>
  );
}
