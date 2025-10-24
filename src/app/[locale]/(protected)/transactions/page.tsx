import ColumnWrapper from "@/components/providers/column-wrapper";
import { getTransactionsPaginated } from "@/server/actions/transaction-actions";
import { TransactionColumn } from "@/utils/columns/transaction-column";

export default async function TransactionsPage(
  props: PageProps<"/[locale]/transactions">
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const transactions = await getTransactionsPaginated({ page, pageSize });
  if (!transactions.data) return null;
  return (
    <div className="space-y-6">
      <ColumnWrapper
        column={TransactionColumn}
        data={transactions.data.transactions}
        totalCount={transactions.data.totalCount}
        page={page}
        pageSize={pageSize}
        tag="transactions"
      />
    </div>
  );
}
