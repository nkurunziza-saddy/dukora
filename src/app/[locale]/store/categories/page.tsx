import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import CategoryCard from "@/components/store/category-card";
import { Button } from "@/components/ui/button";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getCategoriesForStore } from "@/server/actions/product-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.categories",
  });
}

export default async function CategoriesPage() {
  const t = await getTranslations("store");

  const { data: categories, error } = await getCategoriesForStore();

  if (error) {
    return (
      <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]">
        <div className="pgtx">
          <div className="text-center text-destructive">
            {t("errorLoadingCategories")}
          </div>
        </div>
      </div>
    );
  }

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

        {!categories || categories.length === 0 ? (
          <div className="text-center py-12">
            <h3 className=" mb-2">{t("noCategoriesFound")}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("noCategoriesDescription")}
            </p>
            <Button render={<Link href="/store" />} size={"sm"}>
              {t("backToStore")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
            {categories.map((category) => (
              <CategoryCard category={category} key={category.id} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
