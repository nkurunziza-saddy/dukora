import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import {
  SelectProduct,
  SelectCategory,
  SelectProductVariant,
  SelectProductSupplier,
  SelectTransaction,
  SelectWarehouseItem,
  SelectWarehouse,
} from "@/lib/schema/schema-types";

type ExtendedProductPayload = SelectProduct & {
  category: SelectCategory | null;
  productVariants: SelectProductVariant[];
  productSuppliers: SelectProductSupplier[];
  transactions: SelectTransaction[];
  warehouseItems: (SelectWarehouseItem & {
    warehouse: SelectWarehouse;
  })[];
};

export default async function ProductSummaryCard({
  product,
}: {
  product: ExtendedProductPayload;
}) {
  const t = await getTranslations("product");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("summary")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("sku")}
          </p>
          <p>{product.sku}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("barcode")}
          </p>
          <p>{product.barcode || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("category")}
          </p>
          <p>{product.category?.name || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("price")}
          </p>
          <p>{product.price}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("costPrice")}
          </p>
          <p>{product.costPrice}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("reorderPoint")}
          </p>
          <p>{product.reorderPoint}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("maxStock")}
          </p>
          <p>{product.maxStock}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("unit")}
          </p>
          <p>{product.unit}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("weight")}
          </p>
          <p>{product.weight || "N/A"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
