import type { Metadata } from "next";
import { Suspense } from "react";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { TableSkeleton } from "@/components/skeletons";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getProductsPaginated } from "@/server/actions/inventory/products-actions";
import { ProductColumn } from "@/utils/columns/product-column";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "products",
  });
}

async function ProductsTable({
  page,
  pageSize,
  sorting,
  filters,
  search,
}: {
  page: number;
  pageSize: number;
  sorting?: { id: string; desc: boolean }[];
  filters?: { id: string; value: unknown }[];
  search?: string;
}) {
  const products = await getProductsPaginated({
    page,
    pageSize,
    sorting,
    filters,
    search,
  });

  if (!products.data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No products found
      </div>
    );
  }

  return (
    <ColumnWrapper
      column={ProductColumn}
      data={products.data.products}
      page={page}
      pageSize={pageSize}
      tag="products"
      totalCount={products.data.totalCount}
      sorting={sorting}
      search={search}
    />
  );
}

export default async function ProductsPage(
  props: PageProps<"/[locale]/products">,
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  let sorting: { id: string; desc: boolean }[] | undefined;
  if (query.sort) {
    const sortParam = String(query.sort);
    const [id, desc] = sortParam.split(".");
    sorting = [{ id, desc: desc === "desc" }];
  }

  let filters: { id: string; value: unknown }[] | undefined;
  if (query.status) {
    filters = [{ id: "status", value: query.status }];
  }

  const search = typeof query.search === "string" ? query.search : undefined;

  return (
    <div className="space-y-6">
      <Suspense fallback={<TableSkeleton />}>
        <ProductsTable
          page={page}
          pageSize={pageSize}
          sorting={sorting}
          filters={filters}
          search={search}
        />
      </Suspense>
    </div>
  );
}
