import ColumnWrapper from "@/components/providers/column-wrapper";
import { getProductsPaginated } from "@/server/actions/product-actions";
import { ProductColumn } from "@/utils/columns/product-column";

export default async function ProductsPage(
  props: PageProps<"/[locale]/products">
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const products = await getProductsPaginated({ page, pageSize });
  if (!products.data) return null;
  return (
    <div className="space-y-6">
      <ColumnWrapper
        column={ProductColumn}
        data={products.data.products}
        totalCount={products.data.totalCount}
        page={page}
        pageSize={pageSize}
        tag="products"
      />
    </div>
  );
}
