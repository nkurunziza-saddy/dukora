import ColumnWrapper from "@/components/providers/column-wrapper";
import { getTransactions } from "@/server/actions/transaction-actions";
import { TransactionColumn } from "@/utils/columns/transaction-column";

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  if (!transactions.data) return null;
  return (
    <div className="space-y-6">
      <ColumnWrapper
        column={TransactionColumn}
        data={transactions.data}
        tag="transactions"
      />
    </div>
  );
}
