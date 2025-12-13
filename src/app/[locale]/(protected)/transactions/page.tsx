import type { Metadata } from "next";
import { Suspense } from "react";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { TableSkeleton } from "@/components/skeletons";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getTransactionsPaginated } from "@/server/actions/transaction-actions";
import { TransactionColumn } from "@/utils/columns/transaction-column";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "transactions",
  });
}

async function TransactionsTable({
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
  const transactions = await getTransactionsPaginated({
    page,
    pageSize,
    sorting,
    filters,
    search,
  });

  if (!transactions.data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <ColumnWrapper
      column={TransactionColumn}
      data={transactions.data.transactions}
      page={page}
      pageSize={pageSize}
      tag="transactions"
      totalCount={transactions.data.totalCount}
      enableManualSorting={true}
      enableManualFiltering={true}
    />
  );
}

export default async function TransactionsPage(
  props: PageProps<"/[locale]/transactions">
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  // Parse sorting
  let sorting: { id: string; desc: boolean }[] | undefined;
  if (query.sort) {
    const sortParam = String(query.sort);
    const [id, desc] = sortParam.split(".");
    sorting = [{ id, desc: desc === "desc" }];
  }

  // Parse filters
  // For now, we only support "type" filter as per requirement/repo implementation
  let filters: { id: string; value: unknown }[] | undefined;
  if (query.type) {
    filters = [{ id: "type", value: query.type }];
  }

  const search = typeof query.search === "string" ? query.search : undefined;

  return (
    <div className="space-y-6">
      <Suspense fallback={<TableSkeleton />}>
        <TransactionsTable
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
