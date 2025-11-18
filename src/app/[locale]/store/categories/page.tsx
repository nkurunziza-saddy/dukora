import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import CategoriesList from "@/components/store/categories-list";
import { Skeleton } from "@/components/ui/skeleton";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.categories",
  });
}

function CategoriesLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="bg-background p-4" key={`category-skeleton-${i}`}>
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export default async function CategoriesPage() {
  const t = await getTranslations("store");

  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]">
      <div className="pgtx">
        <div className="mb-10">
          <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
            {t("categories")}
          </h1>
          <p className="text-sm text-text-secondary text-pretty">
            {t("browseCategories")}
          </p>
        </div>
        <Suspense fallback={<CategoriesLoading />}>
          <CategoriesList />
        </Suspense>
      </div>
    </div>
  );
}
