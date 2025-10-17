import { Suspense } from "react";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { getTransactions } from "@/server/actions/transaction-actions";
import { TransactionColumn } from "@/utils/columns/transaction-column";

function TransactionsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-b-0">
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function TransactionsContent() {
  const transactions = await getTransactions({});

  if (!transactions.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <ColumnWrapper
      column={TransactionColumn}
      data={transactions.data}
      tag="transactions"
    />
  );
}

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<TransactionsLoading />}>
        <TransactionsContent />
      </Suspense>
    </div>
  );
}
