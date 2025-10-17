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
import type { SelectProductSupplier } from "@/lib/schema/schema-types";

export default async function ProductSuppliers({
  productSupplier,
}: {
  productSupplier: SelectProductSupplier[];
}) {
  const t = await getTranslations("product");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("date")}</TableHead>
          <TableHead>{t("supplierProductCode")}</TableHead>
          <TableHead>{t("supplierPrice")}</TableHead>
          <TableHead>{t("leadTimeDays")}</TableHead>
          <TableHead>{t("isPreferred")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productSupplier.map((supplier) => (
          <TableRow key={supplier.productId}>
            <TableCell>{format(new Date(supplier.updatedAt), "PPP")}</TableCell>
            <TableCell>{supplier.supplierProductCode}</TableCell>
            <TableCell>{supplier.supplierPrice}</TableCell>
            <TableCell>{supplier.leadTimeDays}</TableCell>
            <TableCell>{supplier.isPreferred ? "Yes" : "No"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
