import { AlertCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import CategoryCard from "@/components/store/category-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getCategoriesForStore } from "@/server/actions/product-actions";

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

async function CategoriesContent() {
  const { data: categories, error } = await getCategoriesForStore();
  const t = await getTranslations("store");
  if (error) {
    return (
      <Alert className="max-w-xl" variant="error">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertDescription>{t("errorLoadingCategories")}</AlertDescription>
      </Alert>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("noCategoriesFound")}</EmptyTitle>
          <EmptyDescription>{t("noCategoriesDescription")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href="/store" />} size={"sm"}>
            {t("backToStore")}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
      {categories.map((category) => (
        <CategoryCard category={category} key={category.id} t={t} />
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]">
      <div className="pgtx">
        <div className="mb-10">
          <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
            Categories
          </h1>
          <p className="text-sm text-text-secondary text-pretty">
            Browse Categories
          </p>
        </div>

        <Suspense fallback={<CategoriesLoading />}>
          <CategoriesContent />
        </Suspense>
      </div>
    </div>
  );
}
