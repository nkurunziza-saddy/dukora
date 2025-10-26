import { constructMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { getProductsPaginated } from "@/server/actions/product-actions";
import { ProductColumn } from "@/utils/columns/product-column";
import { TableSkeleton } from "@/components/table-skeleton";

export const metadata: Metadata = constructMetadata({
  title: "Products",
});

async function ProductsTable({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const products = await getProductsPaginated({ page, pageSize });

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
      totalCount={products.data.totalCount}
      page={page}
      pageSize={pageSize}
      tag="products"
    />
  );
}

export default async function ProductsPage(
  props: PageProps<"/[locale]/products">,
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  return (
    <div className="space-y-6">
      <Suspense fallback={<TableSkeleton />}>
        <ProductsTable page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  );
}