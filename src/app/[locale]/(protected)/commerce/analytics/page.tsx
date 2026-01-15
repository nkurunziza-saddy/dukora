import {
  DollarSign,
  Eye,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import StatCard from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { formatCurrencyWithCode } from "@/lib/utils/currency-utils";
import {
  getStorePerformance,
  getTodaysMetrics,
  getTopProducts,
} from "@/server/actions/store/analytics-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "commerce",
  });
}

async function PerformanceStats() {
  const t = await getTranslations("commerceAnalytics.stats");
  const result = await getTodaysMetrics({});
  const metrics = result.data || {
    views: 0,
    addedToCart: 0,
    orders: 0,
    revenue: "0",
  };

  const conversionRate =
    metrics.views > 0
      ? ((metrics.orders / metrics.views) * 100).toFixed(2)
      : "0";

  const cartConversion =
    metrics.addedToCart > 0
      ? ((metrics.orders / metrics.addedToCart) * 100).toFixed(2)
      : "0";

  const avgOrderValue =
    metrics.orders > 0
      ? (Number(metrics.revenue) / metrics.orders).toFixed(2)
      : "0";

  const stats = [
    {
      icon: Eye,
      title: t("storeViews"),
      value: metrics.views.toString(),
      change: t("today"),
    },
    {
      icon: ShoppingCart,
      title: t("cartAdds"),
      value: metrics.addedToCart.toString(),
      change: `${cartConversion}% ${t("toPurchase")}`,
    },
    {
      icon: Package,
      title: t("orders"),
      value: metrics.orders.toString(),
      change: `${conversionRate}% ${t("conversion")}`,
    },
    {
      icon: DollarSign,
      title: t("revenue"),
      value: `$${Number(metrics.revenue).toFixed(2)}`,
      change: `$${avgOrderValue} ${t("avgOrder")}`,
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

async function TopProductsCard() {
  const t = await getTranslations("commerceAnalytics.topProducts");
  const tHeaders = await getTranslations(
    "commerceAnalytics.topProducts.tableHeaders"
  );
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const result = await getTopProducts({
    startDate,
    endDate,
    limit: 10,
    sortBy: "revenue",
  });

  const products = result.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardPanel>
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("noData")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tHeaders("product")}</TableHead>
                <TableHead className="text-right">
                  {tHeaders("views")}
                </TableHead>
                <TableHead className="text-right">
                  {tHeaders("addedToCart")}
                </TableHead>
                <TableHead className="text-right">
                  {tHeaders("orders")}
                </TableHead>
                <TableHead className="text-right">
                  {tHeaders("revenue")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const conversionRate =
                  product.totalViews > 0
                    ? (
                        (product.totalOrders / product.totalViews) *
                        100
                      ).toFixed(1)
                    : "0";

                return (
                  <TableRow key={product.storeProductId}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {product.storeTitle}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {conversionRate}% {t("conversion")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.totalViews}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.totalAddedToCart}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{product.totalOrders}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyWithCode(Number(product.totalRevenue))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardPanel>
    </Card>
  );
}

async function PerformanceOverview() {
  const tPerf = await getTranslations("commerceAnalytics.performance");
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const result = await getStorePerformance({ startDate, endDate });
  const data = result.data;

  if (!data) {
    const tErrors = await getTranslations("commerceAnalytics.errors");
    return (
      <Card>
        <CardPanel className="py-8 text-center text-muted-foreground">
          {tErrors("failedToLoadPerformanceData")}
        </CardPanel>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {tPerf("totalViews")}
          </CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardPanel>
          <div className="text-2xl font-bold">{data.totals.totalViews}</div>
          <p className="text-xs text-muted-foreground">{tPerf("last30Days")}</p>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {tPerf("cartAdditions")}
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardPanel>
          <div className="text-2xl font-bold">
            {data.totals.totalAddedToCart}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.totals.totalViews > 0
              ? `${((data.totals.totalAddedToCart / data.totals.totalViews) * 100).toFixed(1)}% ${tPerf("ofViews")}`
              : tPerf("noViewsYet")}
          </p>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {tPerf("conversionRate")}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardPanel>
          <div className="text-2xl font-bold">{data.conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {data.totals.totalOrders} {tPerf("ordersFrom")}{" "}
            {data.totals.totalViews} {tPerf("views")}
          </p>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {tPerf("totalOrders")}
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardPanel>
          <div className="text-2xl font-bold">{data.totals.totalOrders}</div>
          <p className="text-xs text-muted-foreground">{tPerf("last30Days")}</p>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {tPerf("totalRevenue")}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardPanel>
          <div className="text-2xl font-bold">
            {formatCurrencyWithCode(data.totals.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">{tPerf("last30Days")}</p>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {tPerf("avgOrderValue")}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardPanel>
          <div className="text-2xl font-bold">{data.avgOrderValue}</div>
          <p className="text-xs text-muted-foreground">{tPerf("perOrder")}</p>
        </CardPanel>
      </Card>
    </div>
  );
}

export default async function StoreAnalyticsPage() {
  const t = await getTranslations("commerceAnalytics");
  const tSections = await getTranslations("commerceAnalytics.sections");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {tSections("todaysPerformance")}
        </h2>
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  className="h-32 bg-muted animate-pulse rounded-lg"
                  key={`perf-stat-skeleton-${i}`}
                />
              ))}
            </div>
          }
        >
          <PerformanceStats />
        </Suspense>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {tSections("last30DaysOverview")}
        </h2>
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  className="h-32 bg-muted animate-pulse rounded-lg"
                  key={`overview-skeleton-${i}`}
                />
              ))}
            </div>
          }
        >
          <PerformanceOverview />
        </Suspense>
      </div>

      <Suspense
        fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}
      >
        <TopProductsCard />
      </Suspense>
    </div>
  );
}
