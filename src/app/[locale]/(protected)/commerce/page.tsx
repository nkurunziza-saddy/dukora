import { DollarSign, Package, Store, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import GotoStore from "@/components/commerce/admin/goto-store";
import { InventoryProductsTable } from "@/components/commerce/admin/inventory-products-table";
import { StoreProductsTable } from "@/components/commerce/admin/store-products-table";
import StatCard from "@/components/shared/stat-card";
import { TableSkeleton } from "@/components/skeletons";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { getTodaysMetrics } from "@/server/actions/store/analytics-actions";
import {
  getAdminStoreProducts,
  getAvailableInventoryProducts,
} from "@/server/actions/store/products-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "commerce",
  });
}

async function StoreStats() {
  const metricsResult = await getTodaysMetrics({});
  const metrics = metricsResult.data || {
    views: 0,
    addedToCart: 0,
    orders: 0,
    revenue: "0",
  };

  const stats = [
    {
      icon: DollarSign,
      title: "Today's Revenue",
      value: `$${Number(metrics.revenue).toFixed(2)}`,
      change: `${metrics.orders} orders`,
    },
    {
      icon: Store,
      title: "Store Views",
      value: metrics.views.toString(),
      change: "Today",
    },
    {
      icon: Package,
      title: "Cart Additions",
      value: metrics.addedToCart.toString(),
      change: "Products added to cart",
    },
    {
      icon: TrendingUp,
      title: "Orders",
      value: metrics.orders.toString(),
      change: "Today",
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

async function PublishedProductsTab() {
  const result = await getAdminStoreProducts({
    page: 1,
    pageSize: 50,
    filters: { isPublished: true },
  });

  if (!result.data) {
    return <div className="text-center py-12">Failed to load products</div>;
  }

  return <StoreProductsTable products={result.data.storeProducts} />;
}

async function InventoryProductsTab() {
  const result = await getAvailableInventoryProducts({
    page: 1,
    pageSize: 50,
  });

  if (!result.data) {
    return <div className="text-center py-12">Failed to load products</div>;
  }

  return <InventoryProductsTable products={result.data.products} />;
}

export default async function StoreProductsPage() {
  const getBusinessId = async () => {
    const session = await getCurrentSession();
    return session?.user?.businessId ?? "";
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="head">
          <h1 className="">Online Store</h1>
          <p className="">Manage your online store products and performance</p>
        </div>
        <div>
          <GotoStore businessId={await getBusinessId()} />
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
        <StoreStats />
      </Suspense>

      <Tabs className="space-y-4" defaultValue="published">
        <TabsList>
          <TabsTab value="published">Published Products</TabsTab>
          <TabsTab value="inventory">Inventory</TabsTab>
        </TabsList>

        <TabsPanel className="space-y-4" value="published">
          <Suspense fallback={<TableSkeleton />}>
            <PublishedProductsTab />
          </Suspense>
        </TabsPanel>

        <TabsPanel className="space-y-4" value="inventory">
          <Suspense fallback={<TableSkeleton />}>
            <InventoryProductsTab />
          </Suspense>
        </TabsPanel>
      </Tabs>
    </div>
  );
}
