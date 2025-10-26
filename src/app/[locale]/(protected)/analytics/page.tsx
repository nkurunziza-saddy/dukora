import {
  AlertCircleIcon,
  AlertTriangleIcon,
  BarChart3Icon,
  CalculatorIcon,
  CheckCircleIcon,
  DollarSignIcon,
  InfoIcon,
  PackageIcon,
  ShoppingCartIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import StatCard from "@/components/shared/stat-card";
import { TimeRange } from "@/components/time-range";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { constructMetadata } from "@/lib/config/metadata";
import { formatCurrency, formatKeys, formatNumber } from "@/lib/utils";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { calculateAndSyncMonthlyMetrics } from "@/server/actions/metrics-action";
import { ErrorCode } from "@/server/constants/errors";
import {
  getCurrentMonthBoundary,
  getMonthData,
} from "@/server/helpers/time-date-forrmatters";

export const metadata: Metadata = constructMetadata({
  title: "Analytics",
});

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div className="">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={`revenue-skeleton-${i + 1}`} className="h-32" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={`operating-skeleton-${i + 1}`} className="h-32" />
          ))}
        </div>
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

async function AnalyticsEmptyState({
  businessCreatedAt,
}: {
  businessCreatedAt: Date;
}) {
  const t = await getTranslations("analytics");

  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div className="">
          <h1 className="font-medium tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      <Separator />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("noDataTitle")}
          </CardTitle>
          <CardDescription>{t("noDataDescription")}</CardDescription>
        </CardHeader>
        <CardPanel>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <InfoIcon className="h-4 w-4" />
              <span>
                {t("businessCreatedOn")}:{" "}
                {businessCreatedAt.toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm">
              <p className="mb-2">{t("noDataHelp")}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("noDataHelp1")}</li>
                <li>{t("noDataHelp2")}</li>
                <li>{t("noDataHelp3")}</li>
              </ul>
            </div>
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}

const Analytics = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const time_range = (searchParams.t as string) || "0";
  const session = await getCurrentSession();
  const { date, monthName, year } = getMonthData(Number(time_range));

  const currentBoundary = getCurrentMonthBoundary();
  const analysisDate = date > currentBoundary ? currentBoundary : date;

  const metrics = await calculateAndSyncMonthlyMetrics(analysisDate);
  const t = await getTranslations("analytics");

  if (metrics.error) {
    if (metrics.error === ErrorCode.BEFORE_BUSINESS_CREATION) {
      const createdAtDate = metrics.data as Date;
      return (
        <AnalyticsEmptyState businessCreatedAt={new Date(createdAtDate)} />
      );
    }

    return (
      <Alert variant="error">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertDescription>{formatKeys(metrics.error)}</AlertDescription>
      </Alert>
    );
  }

  const data = metrics.data;

  const revenueMetrics = [
    {
      title: t("totalRevenue"),
      value: formatCurrency(data?.grossRevenue || 0),
      icon: DollarSignIcon,
      trend: data?.grossRevenue && data.grossRevenue > 0 ? "up" : "neutral",
      description: t("totalRevenueDesc"),
    },
    {
      title: t("netRevenue"),
      value: formatCurrency(data?.netRevenue || 0),
      icon: TrendingUpIcon,
      trend: data?.netRevenue && data.netRevenue > 0 ? "up" : "neutral",
      description: t("netRevenueDesc"),
    },
    {
      title: t("grossProfit"),
      value: formatCurrency(data?.grossProfit || 0),
      icon: BarChart3Icon,
      trend:
        data?.grossProfit && data.grossProfit > 0
          ? "up"
          : data?.grossProfit && data.grossProfit < 0
            ? "down"
            : "neutral",
      description: t("grossProfitDesc"),
    },
    {
      title: t("netIncome"),
      value: formatCurrency(data?.netIncome || 0),
      icon: WalletIcon,
      trend:
        data?.netIncome && data.netIncome > 0
          ? "up"
          : data?.netIncome && data.netIncome < 0
            ? "down"
            : "neutral",
      description: t("netIncomeDesc"),
    },
  ];

  const operatingMetrics = [
    {
      title: t("operatingIncome"),
      value: formatCurrency(data?.operatingIncome || 0),
      icon: CalculatorIcon,
      trend:
        data?.operatingIncome && data.operatingIncome > 0
          ? "up"
          : data?.operatingIncome && data.operatingIncome < 0
            ? "down"
            : "neutral",
      description: t("operatingIncomeDesc"),
    },
    {
      title: t("operatingExpenses"),
      value: formatCurrency(data?.operatingExpenses || 0),
      icon: TrendingDownIcon,
      trend: "neutral",
      description: t("operatingExpensesDesc"),
    },
    {
      title: t("expenseRatio"),
      value: `${data?.expenseRatio || 0}%`,
      icon: BarChart3Icon,
      trend:
        data?.expenseRatio && data.expenseRatio < 30
          ? "up"
          : data?.expenseRatio && data.expenseRatio > 50
            ? "down"
            : "neutral",
      description: t("expenseRatioDesc"),
    },
  ];

  const salesMetrics = [
    {
      label: t("transactionCount"),
      value: formatNumber(data?.transactionCount || 0),
      category: t("salesCategory"),
      icon: ShoppingCartIcon,
    },
    {
      label: t("averageOrderValue"),
      value: formatCurrency(data?.averageOrderValue || 0),
      category: t("salesCategory"),
      icon: DollarSignIcon,
    },
    {
      label: t("uniqueProductsSold"),
      value: formatNumber(data?.uniqueProductsSold || 0),
      category: t("salesCategory"),
      icon: PackageIcon,
    },
    {
      label: t("returns"),
      value: formatCurrency(data?.returns || 0),
      category: t("salesCategory"),
      icon: TrendingDownIcon,
    },
    {
      label: t("returnRate"),
      value: `${data?.returnRate || 0}%`,
      category: t("salesCategory"),
      icon: AlertTriangleIcon,
    },
  ];

  const inventoryMetrics = [
    {
      label: t("openingStock"),
      value: formatCurrency(data?.openingStock || 0),
      category: t("inventoryCategory"),
      icon: PackageIcon,
    },
    {
      label: t("closingStock"),
      value: formatCurrency(data?.closingStock || 0),
      category: t("inventoryCategory"),
      icon: PackageIcon,
    },
    {
      label: t("purchases"),
      value: formatCurrency(data?.purchases || 0),
      category: t("inventoryCategory"),
      icon: ShoppingCartIcon,
    },
    {
      label: t("costOfGoodsSold"),
      value: formatCurrency(data?.costOfGoodsSold || 0),
      category: t("inventoryCategory"),
      icon: CalculatorIcon,
    },
    {
      label: t("inventoryTurnover"),
      value: formatNumber(data?.inventoryTurnover || 0),
      category: t("inventoryCategory"),
      icon: TrendingUpIcon,
    },
    {
      label: t("daysOnHand"),
      value: `${data?.daysOnHand || 0} days`,
      category: t("inventoryCategory"),
      icon: InfoIcon,
    },
    {
      label: t("inventoryGrowth"),
      value: `${data?.inventoryGrowth || 0}%`,
      category: t("inventoryCategory"),
      icon:
        data?.inventoryGrowth && data.inventoryGrowth > 0
          ? TrendingUpIcon
          : TrendingDownIcon,
    },
  ];

  const profitabilityMetrics = [
    {
      label: t("grossMargin"),
      value: `${data?.grossMargin || 0}%`,
      category: t("marginsCategory"),
      icon: BarChart3Icon,
    },
    {
      label: t("netMargin"),
      value: `${data?.netMargin || 0}%`,
      category: t("marginsCategory"),
      icon: BarChart3Icon,
    },
    {
      label: t("operatingMargin"),
      value: `${data?.operatingMargin || 0}%`,
      category: t("marginsCategory"),
      icon: BarChart3Icon,
    },
    {
      label: t("assetTurnover"),
      value: formatNumber(data?.assetTurnover || 0),
      category: t("efficiencyCategory"),
      icon: TrendingUpIcon,
    },
  ];

  const allDetailedMetrics = [
    ...salesMetrics,
    ...inventoryMetrics,
    ...profitabilityMetrics,
  ];
  if (!session) {
    return null;
  }
  return (
    <main className="space-y-8 p-4" aria-label="Analytics Dashboard">
      <header className="flex items-center justify-between">
        <div className="">
          <h1 className="font-medium tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("description")}: {monthName} {year}
          </p>
        </div>
        <TimeRange currentValue={time_range} session={session} />
      </header>

      <Separator />

      <section className="space-y-6" aria-labelledby="revenue-section">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <CardTitle id="revenue-section" className="text-xl font-semibold">
            {t("revenueProfitability")}
          </CardTitle>
          <Badge variant="secondary" className="w-fit">
            {t("keyMetrics")}
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueMetrics.map((metric) => {
            return (
              <StatCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                subText={metric.description}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="operating-section">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <CardTitle id="operating-section" className="text-xl font-semibold">
            {t("operatingPerformance")}
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            {t("cashFlow")}
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {operatingMetrics.map((metric) => {
            return (
              <StatCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                subText={metric.description}
              />
            );
          })}
        </div>
      </section>

      {data?.dataQuality && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircleIcon className="h-5 w-5" />
              {t("dataQuality")}
            </CardTitle>
            <CardDescription>
              Data quality metrics for the selected period
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="font-medium text-sm">{t("totalTransactions")}</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(data.dataQuality.totalTransactions)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">{t("validTransactions")}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(data.dataQuality.validTransactions)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">{t("hasInventoryData")}</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${data.dataQuality.hasInventoryData ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="font-semibold">
                    {data.dataQuality.hasInventoryData ? t("yes") : t("no")}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">{t("hasExpenseData")}</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${data.dataQuality.hasExpenseData ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="font-semibold">
                    {data.dataQuality.hasExpenseData ? t("yes") : t("no")}
                  </span>
                </div>
              </div>
            </div>
          </CardPanel>
        </Card>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <CardTitle className="text-xl font-semibold">
            {t("detailedMetrics")}
          </CardTitle>
          <Badge variant="secondary" className="w-fit">
            {t("completeOverview")}
          </Badge>
        </div>
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg">{t("financialBreakdown")}</CardTitle>
            <CardDescription>
              {t("financialBreakdownDescription")}
            </CardDescription>
          </CardHeader>
          <CardPanel className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="font-semibold px-6 py-4">
                      {t("metric")}
                    </TableHead>
                    <TableHead className="font-semibold px-6 py-4">
                      {t("category")}
                    </TableHead>
                    <TableHead className="text-right font-semibold px-6 py-4">
                      {t("value")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDetailedMetrics.map((metric, index) => {
                    const IconComponent = metric.icon || InfoIcon;
                    return (
                      <TableRow
                        key={metric.label}
                        className={`hover:bg-muted/50 transition-colors ${
                          index % 2 === 0 ? "bg-background" : "bg-muted/20"
                        }`}
                      >
                        <TableCell className="font-medium px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span>{metric.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant={
                              metric.category === t("salesCategory")
                                ? "green"
                                : metric.category === t("inventoryCategory")
                                  ? "blue"
                                  : metric.category === t("expensesCategory")
                                    ? "redStrong"
                                    : metric.category === t("marginsCategory")
                                      ? "purple"
                                      : metric.category ===
                                          t("efficiencyCategory")
                                        ? "orange"
                                        : "default"
                            }
                            className="font-medium"
                          >
                            {metric.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold px-6 py-4 text-lg">
                          {metric.value}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardPanel>
        </Card>
      </div>
    </main>
  );
};

export default async function AnalyticsPage(
  props: PageProps<"/[locale]/analytics">,
) {
  const searchParams = await props.searchParams;
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <Analytics searchParams={searchParams} />
    </Suspense>
  );
}
