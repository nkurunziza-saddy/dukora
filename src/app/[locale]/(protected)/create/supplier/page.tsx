import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import SupplierForm from "@/components/forms/create-supplier-form";
import { FormHeaderSkeleton, GuardSkeleton } from "@/components/skeletons";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "createSupplier",
  });
}

async function PageContent() {
  const t = await getTranslations("metadata.pages.createSupplier");

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground mt-2">{t("description")}</p>
    </div>
  );
}

export default function CreateSupplierPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<FormHeaderSkeleton />}>
          <PageContent />
        </Suspense>
        <Suspense fallback={<GuardSkeleton />}>
          <SupplierForm />
        </Suspense>
      </div>
    </div>
  );
}
