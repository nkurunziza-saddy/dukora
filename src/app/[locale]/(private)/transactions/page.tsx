import { DataTable } from "@/components/table/data-table";
import { getTransactions } from "@/server/actions/transaction-actions";
import { TransactionColumn } from "@/utils/columns/transaction-column";

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  if (!transactions.data) return null;
  return (
    <div className="space-y-6">
      <DataTable
        columns={TransactionColumn}
        data={transactions.data}
        tag="transactions"
      />
    </div>
  );
}
