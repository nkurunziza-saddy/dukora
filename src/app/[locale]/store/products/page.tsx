import { FilterIcon, GridIcon, ListIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ProductCard from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getProductsForStore } from "@/server/actions/product-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.products",
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("store");
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search as string;
  const category = resolvedSearchParams.category as string;
  const sortBy = (resolvedSearchParams.sortBy as string) || "name";
  const sortOrder = (resolvedSearchParams.sortOrder as string) || "asc";

  const { data: productsData, error } = await getProductsForStore({
    page,
    pageSize: 12,
    search,
    category,
    sortBy: sortBy as "name" | "price" | "createdAt",
    sortOrder: sortOrder as "asc" | "desc",
  });

  if (error) {
    return (
      <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]">
        <div className="pgtx">
          <div className="text-center text-destructive">
            {t("errorLoadingProducts")}
          </div>
        </div>
      </div>
    );
  }

  const products = productsData?.products || [];
  const totalPages = productsData?.totalPages || 1;

  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)] ">
      <div className="pgtx ">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
            {t("allProducts")}
          </h1>
          <p className="text-sm text-text-secondary text-pretty">
            {t("browseAllProducts")} ({productsData?.totalCount || 0}{" "}
            {t("products")})
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

        {products.length === 0 ? (
          <Empty>
            <EmptyTitle>{t("noProductsFound")}</EmptyTitle>
            <EmptyDescription>{t("tryDifferentFilters")}</EmptyDescription>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button disabled={page === 1} variant="outline">
                {t("previous")}
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={page === pageNum ? "default" : "outline"}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button disabled={page === totalPages} variant="outline">
                {t("next")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
