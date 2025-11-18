import { getTranslations } from "next-intl/server";
import ProductCard from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { getProductsForStore } from "@/server/actions/product-actions";

interface ProductsListProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ProductsList({
  searchParams,
}: ProductsListProps) {
  const t = await getTranslations("store");

  const page = Number((await searchParams).page) || 1;
  const search = (await searchParams).search as string;
  const category = (await searchParams).category as string;
  const sortBy = ((await searchParams).sortBy as string) || "name";
  const sortOrder = ((await searchParams).sortOrder as string) || "asc";

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
      <div className="text-center text-destructive">
        {t("errorLoadingProducts")}
      </div>
    );
  }

  const products = productsData?.products || [];
  const totalPages = productsData?.totalPages || 1;

  return (
    <>
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
    </>
  );
}
