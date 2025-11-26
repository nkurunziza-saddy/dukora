import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import PurchaseTransactionForm from "@/components/forms/purchase-transaction-form";
import { FormHeaderSkeleton, GuardSkeleton } from "@/components/skeletons";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "createPurchase",
  });
}

async function PageContent() {
  const t = await getTranslations("metadata.pages.createPurchase");
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground mt-2">{t("description")}</p>
    </div>
  );
}

export default function CreatePurchasePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<FormHeaderSkeleton />}>
          <PageContent />
        </Suspense>

        <Suspense fallback={<GuardSkeleton />}>
          <PurchaseTransactionForm />
        </Suspense>
      </div>
    </div>
  );
}
