import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutView } from "@/components/store/checkout/checkout-view";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.checkout",
  });
}

export default async function CheckoutPage() {
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
