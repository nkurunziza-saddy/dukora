import { DataTable } from "@/components/table/data-table";
import { getProducts } from "@/server/actions/product-actions";
import { ProductColumn } from "@/utils/columns/product-column";

export default async function ProductsPage() {
  const products = await getProducts();
  if (!products.data) return null;
  return (
    <div className="space-y-6">
      <DataTable columns={ProductColumn} data={products.data} tag="products" />
    </div>
  );
}
