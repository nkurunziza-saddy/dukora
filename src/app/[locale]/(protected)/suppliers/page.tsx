import { getSuppliers } from "@/server/actions/supplier-actions";
import { SupplierColumn } from "@/utils/columns/supplier-column";
import ColumnWrapper from "@/components/providers/column-wrapper";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers({});
  if (!suppliers.data) return null;
  return (
    <div className="space-y-6">
      <ColumnWrapper
        column={SupplierColumn}
        data={suppliers.data}
        tag="suppliers"
      />
    </div>
  );
}
