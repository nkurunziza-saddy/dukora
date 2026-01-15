import type { Metadata } from "next";
import { Suspense } from "react";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { TableSkeleton } from "@/components/skeletons";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getSuppliersPaginated } from "@/server/actions/supplier-actions";
import { SupplierColumn } from "@/utils/columns/supplier-column";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "suppliers",
  });
}

async function SuppliersTable({
  page,
  pageSize,
  sorting,
  search,
}: {
  page: number;
  pageSize: number;
  sorting?: { id: string; desc: boolean }[];
  search?: string;
}) {
  const suppliers = await getSuppliersPaginated({
    page,
    pageSize,
    sorting,
    search,
  });

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
      page={page}
      pageSize={pageSize}
      tag="suppliers"
      totalCount={suppliers.data.totalCount}
      sorting={sorting}
      search={search}
    />
  );
}

export default async function SuppliersPage(
  props: PageProps<"/[locale]/suppliers">,
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

  const search = typeof query.search === "string" ? query.search : undefined;

  return (
    <div className="space-y-6">
      <Suspense fallback={<TableSkeleton />}>
        <SuppliersTable
          page={page}
          pageSize={pageSize}
          sorting={sorting}
          search={search}
        />
      </Suspense>
    </div>
  );
}
