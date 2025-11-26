import { getTranslations } from "next-intl/server";
import { getProductsForStore } from "@/server/actions/inventory/products-actions";
import { ProductsListClient } from "./products-list-client";

interface ProductsListProps {
  searchParams: { [key: string]: string | string[] | undefined };
  businessId: string;
}

export default async function ProductsList({
  searchParams,
  businessId,
}: ProductsListProps) {
  const t = await getTranslations("store");

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search as string;
  const category = searchParams.category as string;
  const sortBy = (searchParams.sortBy as string) || "name";
  const sortOrder = (searchParams.sortOrder as string) || "asc";

  const { data: productsData, error } = await getProductsForStore({
    businessId,
    filters: {
      page,
      pageSize: 12,
      search,
      category,
      sortBy: sortBy as "name" | "price" | "createdAt",
      sortOrder: sortOrder as "asc" | "desc",
    },
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
    <ProductsListClient
      currentPage={page}
      products={products}
      searchParams={searchParams}
      totalPages={totalPages}
    />
  );
}
