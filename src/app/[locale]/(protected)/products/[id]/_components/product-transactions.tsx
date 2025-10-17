import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExtendedProductPayload } from "@/lib/schema/schema-types";

export default async function ProductTransactions({
  transactions,
}: {
  transactions: ExtendedProductPayload["transactions"];
}) {
  const t = await getTranslations("product");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("date")}</TableHead>
          <TableHead>{t("type")}</TableHead>
          <TableHead>{t("quantity")}</TableHead>
          <TableHead>{t("reference")}</TableHead>
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
