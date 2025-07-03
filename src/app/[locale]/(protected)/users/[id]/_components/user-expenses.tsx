import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTranslations } from "next-intl/server";
import type { SelectExpense } from "@/lib/schema/schema-types";
import { format } from "date-fns";

export default async function UserExpenses({
  expenses,
}: {
  expenses: SelectExpense[];
}) {
  const t = await getTranslations("users");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("expenseDate")}</TableHead>
          <TableHead>{t("expenseAmount")}</TableHead>
          <TableHead>{t("expenseNote")}</TableHead>
          <TableHead>{t("expenseReference")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>{format(new Date(expense.createdAt), "PPP")}</TableCell>
            <TableCell>{expense.amount}</TableCell>
            <TableCell>{expense.note}</TableCell>
            <TableCell>{expense.reference || "N/A"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
