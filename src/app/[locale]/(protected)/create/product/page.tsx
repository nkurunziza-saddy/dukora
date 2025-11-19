import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import CreateProductForm from "@/components/forms/create-product-form";
import { GuardSkeleton } from "@/components/skeletons";
import FormHeaderSkeleton from "@/components/skeletons/form-header-skeleton";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "createProduct",
  });
}

async function PageContent() {
  const t = await getTranslations("metadata.pages.createProduct");

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground mt-2">{t("description")}</p>
    </div>
  );
}
export default function CreateProductPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<FormHeaderSkeleton />}>
          <PageContent />
        </Suspense>

        <Suspense fallback={<GuardSkeleton />}>
          <CreateProductForm />
        </Suspense>
      </div>
    </div>
  );
}
