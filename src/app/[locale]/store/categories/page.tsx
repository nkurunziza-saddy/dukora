import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getCategoriesForStore } from "@/server/actions/product-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.categories",
  });
}

export default async function CategoriesPage() {
  const t = await getTranslations("store");

  // Get real categories data
  const { data: categories, error } = await getCategoriesForStore();

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center text-destructive">
          {t("errorLoadingCategories")}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("categories")}</h1>
        <p className="text-muted-foreground">{t("browseCategories")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <Card
            className="group hover:shadow-lg transition-shadow"
            key={category.id}
          >
            <CardHeader>
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-4">
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  {t("noImage")}
                </div>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {category.value}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {category.description || t("noDescription")}
              </p>
            </CardHeader>
            <CardPanel>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {category.productCount} {t("products")}
                </Badge>
                <Button
                  render={
                    <Link href={`/store/products?category=${category.value}`} />
                  }
                  size="sm"
                  variant="outline"
                >
                  {t("viewAll")}
                </Button>
              </div>
            </CardPanel>
          </Card>
        )) || []}
      </div>

      {(!categories || categories.length === 0) && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">{t("noCategoriesFound")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("noCategoriesDescription")}
          </p>
          <Button render={<Link href="/store" />}>{t("backToStore")}</Button>
        </div>
      )}
    </div>
  );
}
