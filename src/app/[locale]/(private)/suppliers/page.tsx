import { DataTable } from "@/components/table/data-table";
import { getSuppliers } from "@/server/actions/supplier-actions";
import { SupplierColumn } from "@/utils/columns/supplier-column";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  if (!suppliers.data) return null;
  return (
    <div className="space-y-6">
      <DataTable
        columns={SupplierColumn}
        data={suppliers.data}
        tag="suppliers"
      />
    </div>
  );
}
