import ColumnWrapper from "@/components/providers/column-wrapper";
import { getSuppliersPaginated } from "@/server/actions/supplier-actions";
import { SupplierColumn } from "@/utils/columns/supplier-column";

export default async function SuppliersPage(
  props: PageProps<"/[locale]/suppliers">
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const suppliers = await getSuppliersPaginated({ page, pageSize });
  if (!suppliers.data) return null;
  return (
    <div className="space-y-6">
      <ColumnWrapper
        column={SupplierColumn}
        data={suppliers.data.suppliers}
        totalCount={suppliers.data.totalCount}
        page={page}
        pageSize={pageSize}
        tag="suppliers"
      />
    </div>
  );
}
