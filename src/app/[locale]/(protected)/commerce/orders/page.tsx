import { DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreOrdersTable } from "@/components/commerce/admin/store-orders-table";
import StatCard from "@/components/shared/stat-card";
import { TableSkeleton } from "@/components/skeletons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getStoreOrders } from "@/server/actions/store/orders-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "commerce",
  });
}

async function OrdersStats() {
  const result = await getStoreOrders({
    page: 1,
    pageSize: 1000,
  });

  const orders = result.data?.orders || [];

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );
  const pendingOrders = orders.filter(
    (o) => o.fulfillmentStatus === "PENDING"
  ).length;
  const shippedOrders = orders.filter(
    (o) => o.fulfillmentStatus === "SHIPPED"
  ).length;

  const stats = [
    {
      icon: ShoppingBag,
      title: "Total Orders",
      value: totalOrders.toString(),
      change: `${pendingOrders} pending`,
    },
    {
      icon: DollarSign,
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "All time",
    },
    {
      icon: Package,
      title: "Pending Fulfillment",
      value: (totalOrders - shippedOrders).toString(),
      change: "Awaiting processing",
    },
    {
      icon: TrendingUp,
      title: "Shipped",
      value: shippedOrders.toString(),
      change: "On the way",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          icon={stat.icon}
          key={stat.title}
          subText={stat.change}
          title={stat.title}
          value={stat.value}
        />
      ))}
    </div>
  );
}

async function OrdersTable({
  page,
  pageSize,
  search,
  status,
  fulfillmentStatus,
}: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  fulfillmentStatus?: string;
}) {
  const result = await getStoreOrders({
    page,
    pageSize,
    filters: { search, status, fulfillmentStatus },
  });

  if (!result.data) {
    return <div className="text-center py-12">Failed to load orders</div>;
  }

  return <StoreOrdersTable orders={result.data.orders} />;
}

export default async function StoreOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    fulfillmentStatus?: string;
  }>;
}) {
  const query = await searchParams;
  const page = Number(query.page) || 1;
  const pageSize = 20;
  const search = query.search;
  const status = query.status;
  const fulfillmentStatus = query.fulfillmentStatus;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="head">
          <h1 className="">Store Orders</h1>
          <p className="">Manage orders from your online store</p>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div className="h-32 bg-muted animate-pulse rounded-lg" key={i} />
            ))}
          </div>
        }
      >
        <OrdersStats />
      </Suspense>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          className="sm:max-w-xs"
          defaultValue={search}
          placeholder="Search by order number, customer..."
        />
        <Select defaultValue={status || "all"}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectPopup>
        </Select>
        <Select defaultValue={fulfillmentStatus || "all"}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            <SelectItem value="all">All Fulfillment</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
            <SelectItem value="PICKED">Picked</SelectItem>
            <SelectItem value="PACKED">Packed</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
          </SelectPopup>
        </Select>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <OrdersTable
          fulfillmentStatus={
            fulfillmentStatus !== "all" ? fulfillmentStatus : undefined
          }
          page={page}
          pageSize={pageSize}
          search={search}
          status={status !== "all" ? status : undefined}
        />
      </Suspense>
    </div>
  );
}
