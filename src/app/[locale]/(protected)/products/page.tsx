import ColumnWrapper from "@/components/providers/column-wrapper";
import { getProducts } from "@/server/actions/product-actions";
import { ProductColumn } from "@/utils/columns/product-column";

export default async function ProductsPage() {
  const products = await getProducts({});
  if (!products.data) return null;
  return (
    <div className="space-y-6">
      <ColumnWrapper
        column={ProductColumn}
        data={products.data}
        tag="products"
      />
    </div>
  );
}
