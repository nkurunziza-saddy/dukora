import { FilterIcon, GridIcon, ListIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import ProductsList from "@/components/store/products-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.products",
  });
}

function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div className="bg-background p-4" key={`product-skeleton-${i}`}>
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("store");
  const search = (await searchParams).search as string;
  const sortBy = ((await searchParams).sortBy as string) || "name";

  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)] ">
      <div className="pgtx ">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
            {t("allProducts")}
          </h1>
          <p className="text-sm text-text-secondary text-pretty">
            {t("browseAllProducts")}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Input
                  className=""
                  defaultValue={search}
                  placeholder={t("searchProducts")}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select defaultValue={sortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue className={"capitalize"} />
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="">{t("sortBy")}</SelectItem>
                  <SelectItem value="name">{t("sortByName")}</SelectItem>
                  <SelectItem value="price">{t("sortByPrice")}</SelectItem>
                  <SelectItem value="createdAt">{t("sortByNewest")}</SelectItem>
                </SelectPopup>
              </Select>

              <div className="flex border rounded-lg">
                <Button className="rounded-r-none" size="sm" variant="ghost">
                  <GridIcon className="h-4 w-4" />
                </Button>
                <Button className="rounded-l-none" size="sm" variant="ghost">
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              <FilterIcon className="mr-2 h-4 w-4" />
              {t("allCategories")}
            </Button>
            <Button size="sm" variant="outline">
              {t("electronics")}
            </Button>
            <Button size="sm" variant="outline">
              {t("clothing")}
            </Button>
            <Button size="sm" variant="outline">
              {t("books")}
            </Button>
          </div>
        </div>

        <Suspense fallback={<ProductsLoading />}>
          <ProductsList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
