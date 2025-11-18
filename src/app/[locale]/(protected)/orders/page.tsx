import type { Metadata } from "next";
import { Suspense } from "react";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { TableSkeleton } from "@/components/skeletons";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getPurchaseOrdersPaginated } from "@/server/actions/purchase-order-actions";
import { OrderColumn } from "@/utils/columns/order-column";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "orders",
  });
}

async function OrdersTable({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const orders = await getPurchaseOrdersPaginated({ page, pageSize });

  if (!orders.data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No orders found
      </div>
    );
  }

  return (
    <ColumnWrapper
      column={OrderColumn}
      data={orders.data.orders}
      page={page}
      pageSize={pageSize}
      tag="orders"
      totalCount={orders.data.totalCount}
    />
  );
}

export default async function OrdersPage(props: PageProps<"/[locale]/orders">) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  return (
    <div className="space-y-6">
      <Suspense fallback={<TableSkeleton />}>
        <OrdersTable page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  );
}
