import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTranslations } from "next-intl/server";
import type { SelectTransaction } from "@/lib/schema/schema-types";
import { format } from "date-fns";

export default async function UserTransactions({
  transactions,
}: {
  transactions: SelectTransaction[];
}) {
  const t = await getTranslations("users");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("transactionDate")}</TableHead>
          <TableHead>{t("transactionType")}</TableHead>
          <TableHead>{t("transactionQuantity")}</TableHead>
          <TableHead>{t("transactionReference")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              {format(new Date(transaction.createdAt), "PPP")}
            </TableCell>
            <TableCell>{transaction.type}</TableCell>
            <TableCell>{transaction.quantity}</TableCell>
            <TableCell>{transaction.reference || "N/A"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
