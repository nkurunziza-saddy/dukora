import Link from "next/link";
import { Suspense } from "react";
import { OrderStats } from "@/components/store/order-stats";
import { OrderStatusBadge } from "@/components/store/order-status-badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getOrderStats,
  getUserOrders,
} from "@/server/actions/shopper/orders-actions";

function TrackOrderLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

async function TrackOrderContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status as string | undefined;

  const [statsResult, ordersResult] = await Promise.all([
    getOrderStats({}),
    getUserOrders({ page, pageSize: 10, status }),
  ]);

  if (statsResult.error || !statsResult.data) {
    return (
      <Empty>
        <EmptyTitle>Error loading order statistics</EmptyTitle>
      </Empty>
    );
  }

  if (ordersResult.error || !ordersResult.data) {
    return (
      <Empty>
        <EmptyTitle>Error loading orders</EmptyTitle>
      </Empty>
    );
  }

  const stats = statsResult.data;
  const { orders, totalPages, currentPage } = ordersResult.data;

  return (
    <div className="space-y-8">
      <OrderStats
        pendingOrders={stats.pendingOrders}
        totalOrders={stats.totalOrders}
        totalSpent={stats.totalSpent}
      />

      {orders.length === 0 ? (
        <Empty>
          <EmptyTitle>No Orders Found</EmptyTitle>
          <EmptyDescription>You haven't placed any orders yet</EmptyDescription>
          <Button render={<Link href="/store" />}>Continue Shopping</Button>
        </Empty>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      render={<Link href={`/store/orders/${order.id}`} />}
                      size="sm"
                      variant="outline"
                    >
                      View Order
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  disabled={currentPage === 1}
                  render={(props) => (
                    <Link href={`?page=${currentPage - 1}`} {...props} />
                  )}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  disabled={currentPage === totalPages}
                  render={(props) => (
                    <Link href={`?page=${currentPage + 1}`} {...props} />
                  )}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)] ">
      <div className="pgtx ">
        <Suspense fallback={<TrackOrderLoading />}>
          <TrackOrderContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
