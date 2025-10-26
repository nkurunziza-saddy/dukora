import { constructMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { getSuppliersPaginated } from "@/server/actions/supplier-actions";
import { SupplierColumn } from "@/utils/columns/supplier-column";
import { TableSkeleton } from "@/components/table-skeleton";

export const metadata: Metadata = constructMetadata({
  title: "Suppliers",
});

async function SuppliersTable({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const suppliers = await getSuppliersPaginated({ page, pageSize });

  if (!suppliers.data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No suppliers found
      </div>
    );
  }

  return (
    <ColumnWrapper
      column={SupplierColumn}
      data={suppliers.data.suppliers}
      totalCount={suppliers.data.totalCount}
      page={page}
      pageSize={pageSize}
      tag="suppliers"
    />
  );
}

export default async function SuppliersPage(
  props: PageProps<"/[locale]/suppliers">,
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  return (
    <div className="space-y-6">
      <Suspense fallback={<TableSkeleton />}>
        <SuppliersTable page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  );
}