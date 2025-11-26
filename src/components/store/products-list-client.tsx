"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import ProductCard from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { useProductView } from "@/lib/hooks/use-product-view";

interface ProductsListClientProps {
  products: any[];
  totalPages: number;
  currentPage: number;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ProductsListClient({
  products,
  totalPages,
  currentPage,
  searchParams,
}: ProductsListClientProps) {
  const t = useTranslations("store");
  const view = useProductView();

  const search = searchParams.search as string;
  const category = searchParams.category as string;
  const sortBy = (searchParams.sortBy as string) || "name";
  const sortOrder = (searchParams.sortOrder as string) || "asc";

  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (sortBy && sortBy !== "name") params.set("sortBy", sortBy);
    if (sortOrder && sortOrder !== "asc") params.set("sortOrder", sortOrder);
    if (newPage > 1) params.set("page", newPage.toString());
    return params.toString() ? `?${params.toString()}` : "";
  };

  return (
    <>
      {products.length === 0 ? (
        <Empty>
          <EmptyTitle>{t("noProductsFound")}</EmptyTitle>
          <EmptyDescription>{t("tryDifferentFilters")}</EmptyDescription>
        </Empty>
      ) : (
        <div
          className={
            view === "list"
              ? "flex flex-col gap-px bg-border border border-border/2"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2"
          }
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} view={view} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              disabled={currentPage === 1}
              render={(props) => (
                <Link href={createPageUrl(currentPage - 1)} {...props} />
              )}
              variant="outline"
            >
              {t("previous")}
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    render={(props) => (
                      <Link href={createPageUrl(pageNum)} {...props} />
                    )}
                    size="sm"
                    variant={currentPage === pageNum ? "default" : "outline"}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              disabled={currentPage === totalPages}
              render={(props) => (
                <Link href={createPageUrl(currentPage + 1)} {...props} />
              )}
              variant="outline"
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
