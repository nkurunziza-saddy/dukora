import Link from "next/link";
import { getTranslations } from "next-intl/server";

import CategoryCard from "@/components/store/category-card";
import { Button } from "@/components/ui/button";
import { getCategoriesForStore } from "@/server/actions/product-actions";

export default async function CategoriesList() {
  const t = await getTranslations("store");

  const { data: categories, error } = await getCategoriesForStore();

  if (error) {
    return (
      <div className="text-center text-destructive">
        {t("errorLoadingCategories")}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className=" mb-2">{t("noCategoriesFound")}</h3>
        <p className="text-muted-foreground text-sm mb-4">
          {t("noCategoriesDescription")}
        </p>
        <Button render={<Link href="/store" />} size={"sm"}>
          {t("backToStore")}
        </Button>
      </div>
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
