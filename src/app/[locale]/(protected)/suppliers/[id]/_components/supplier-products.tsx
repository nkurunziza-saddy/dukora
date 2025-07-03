import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTranslations } from "next-intl/server";
import type { SelectProductSupplier } from "@/lib/schema/schema-types";
import { format } from "date-fns";

export default async function SupplierProducts({ productSupplier }: { productSupplier: SelectProductSupplier[] }) {
  const t = await getTranslations("supplier");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("date")}</TableHead>
          <TableHead>{t("productCode")}</TableHead>
          <TableHead>{t("price")}</TableHead>
          <TableHead>{t("leadTime")}</TableHead>
          <TableHead>{t("isPreferred")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productSupplier.map((product) => (
          <TableRow key={product.productId}>
            <TableCell>{format(new Date(product.updatedAt), "PPP")}</TableCell>
            <TableCell>{product.supplierProductCode}</TableCell>
            <TableCell>{product.supplierPrice}</TableCell>
            <TableCell>{product.leadTimeDays}</TableCell>
            <TableCell>{product.isPreferred ? "Yes" : "No"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
