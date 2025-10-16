import { Card, CardPanel, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import {
  SelectSupplier,
  SelectProductSupplier,
} from "@/lib/schema/schema-types";

type ExtendedSupplierPayload = SelectSupplier & {
  productSuppliers: SelectProductSupplier[];
};

export default async function SupplierSummaryCard({
  supplier,
}: {
  supplier: ExtendedSupplierPayload;
}) {
  const t = await getTranslations("supplier");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("summary")}</CardTitle>
      </CardHeader>
      <CardPanel className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("email")}
          </p>
          <p>{supplier.email || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("phone")}
          </p>
          <p>{supplier.phone || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("address")}
          </p>
          <p>{supplier.address || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("contactPerson")}
          </p>
          <p>{supplier.contactName || "N/A"}</p>
        </div>
      </CardPanel>
    </Card>
  );
}
