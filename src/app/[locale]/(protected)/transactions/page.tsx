import { Suspense } from "react";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { getTransactionsPaginated } from "@/server/actions/transaction-actions";
import { TransactionColumn } from "@/utils/columns/transaction-column";
import { TableSkeleton } from "@/components/table-skeleton";

async function TransactionsTable({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const transactions = await getTransactionsPaginated({ page, pageSize });

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
      totalCount={transactions.data.totalCount}
      page={page}
      pageSize={pageSize}
      tag="transactions"
    />
  );
}

export default async function TransactionsPage(
  props: PageProps<"/[locale]/transactions">,
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  return (
    <div className="space-y-6">
      <Suspense fallback={<TableSkeleton />}>
        <TransactionsTable page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  );
}
