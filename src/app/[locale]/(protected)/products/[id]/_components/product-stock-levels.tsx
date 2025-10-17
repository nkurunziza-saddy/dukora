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

export default async function ProductStockLevels({
  warehouseItems,
}: {
  warehouseItems: ExtendedProductPayload["warehouseItems"];
}) {
  const t = await getTranslations("product");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("warehouse")}</TableHead>
          <TableHead>{t("quantity")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {warehouseItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.warehouse.name}</TableCell>
            <TableCell>{item.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
