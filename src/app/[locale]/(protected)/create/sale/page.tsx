import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import SaleTransactionForm from "@/components/forms/sale-transaction-form";
import { FormHeaderSkeleton, GuardSkeleton } from "@/components/skeletons";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "createSale",
  });
}

async function PageContent() {
  const t = await getTranslations("metadata.pages.createSale");

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground mt-2">{t("description")}</p>
    </div>
  );
}

export default function CreateSalePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<FormHeaderSkeleton />}>
          <PageContent />
        </Suspense>

        <Suspense fallback={<GuardSkeleton />}>
          <SaleTransactionForm />
        </Suspense>
      </div>
    </div>
  );
}
