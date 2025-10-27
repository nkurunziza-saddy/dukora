import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AIAnalyticsAssistant } from "@/components/analytics/ai-analytics-assistant";
import { MetricCard } from "@/components/analytics/metric-card";
import { MetricsTable } from "@/components/analytics/metrics-table";
import { AnalyticsSkeleton } from "@/components/skeletons";
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
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { formatCurrency, formatKeys, formatNumber } from "@/lib/utils";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { calculateAndSyncMonthlyMetrics } from "@/server/actions/metrics-action";
import { ErrorCode } from "@/server/constants/errors";
import {
  getCurrentMonthBoundary,
  getMonthData,
} from "@/server/helpers/time-date-forrmatters";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "analytics",
  });
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
      trend: (data?.grossRevenue && data.grossRevenue > 0
        ? "up"
        : "neutral") as "up" | "down" | "neutral",
      description: t("totalRevenueDesc"),
    },
    {
      title: t("netRevenue"),
      value: formatCurrency(data?.netRevenue || 0),
      trend: (data?.netRevenue && data.netRevenue > 0 ? "up" : "neutral") as
        | "up"
        | "down"
        | "neutral",
      description: t("netRevenueDesc"),
    },
    {
      title: t("grossProfit"),
      value: formatCurrency(data?.grossProfit || 0),
      trend: (data?.grossProfit && data.grossProfit > 0
        ? "up"
        : data?.grossProfit && data.grossProfit < 0
          ? "down"
          : "neutral") as "up" | "down" | "neutral",
      description: t("grossProfitDesc"),
    },
    {
      title: t("netIncome"),
      value: formatCurrency(data?.netIncome || 0),
      trend: (data?.netIncome && data.netIncome > 0
        ? "up"
        : data?.netIncome && data.netIncome < 0
          ? "down"
          : "neutral") as "up" | "down" | "neutral",
      description: t("netIncomeDesc"),
    },
  ];

  const operatingMetrics = [
    {
      title: t("operatingIncome"),
      value: formatCurrency(data?.operatingIncome || 0),
      trend: (data?.operatingIncome && data.operatingIncome > 0
        ? "up"
        : data?.operatingIncome && data.operatingIncome < 0
          ? "down"
          : "neutral") as "up" | "down" | "neutral",
      description: t("operatingIncomeDesc"),
    },
    {
      title: t("operatingExpenses"),
      value: formatCurrency(data?.operatingExpenses || 0),
      trend: "neutral" as "up" | "down" | "neutral",
      description: t("operatingExpensesDesc"),
    },
    {
      title: t("expenseRatio"),
      value: `${data?.expenseRatio || 0}%`,
      trend: (data?.expenseRatio && data.expenseRatio < 30
        ? "up"
        : data?.expenseRatio && data.expenseRatio > 50
          ? "down"
          : "neutral") as "up" | "down" | "neutral",
      description: t("expenseRatioDesc"),
    },
  ];

  const salesMetrics = [
    {
      label: t("transactionCount"),
      value: formatNumber(data?.transactionCount || 0),
      category: t("salesCategory"),
    },
    {
      label: t("averageOrderValue"),
      value: formatCurrency(data?.averageOrderValue || 0),
      category: t("salesCategory"),
    },
    {
      label: t("uniqueProductsSold"),
      value: formatNumber(data?.uniqueProductsSold || 0),
      category: t("salesCategory"),
    },
    {
      label: t("returns"),
      value: formatCurrency(data?.returns || 0),
      category: t("salesCategory"),
    },
    {
      label: t("returnRate"),
      value: `${data?.returnRate || 0}%`,
      category: t("salesCategory"),
    },
  ];

  const inventoryMetrics = [
    {
      label: t("openingStock"),
      value: formatCurrency(data?.openingStock || 0),
      category: t("inventoryCategory"),
    },
    {
      label: t("closingStock"),
      value: formatCurrency(data?.closingStock || 0),
      category: t("inventoryCategory"),
    },
    {
      label: t("purchases"),
      value: formatCurrency(data?.purchases || 0),
      category: t("inventoryCategory"),
    },
    {
      label: t("costOfGoodsSold"),
      value: formatCurrency(data?.costOfGoodsSold || 0),
      category: t("inventoryCategory"),
    },
    {
      label: t("inventoryTurnover"),
      value: formatNumber(data?.inventoryTurnover || 0),
      category: t("inventoryCategory"),
    },
    {
      label: t("daysOnHand"),
      value: `${data?.daysOnHand || 0} days`,
      category: t("inventoryCategory"),
    },
    {
      label: t("inventoryGrowth"),
      value: `${data?.inventoryGrowth || 0}%`,
      category: t("inventoryCategory"),
    },
  ];

  const profitabilityMetrics = [
    {
      label: t("grossMargin"),
      value: `${data?.grossMargin || 0}%`,
      category: t("marginsCategory"),
    },
    {
      label: t("netMargin"),
      value: `${data?.netMargin || 0}%`,
      category: t("marginsCategory"),
    },
    {
      label: t("operatingMargin"),
      value: `${data?.operatingMargin || 0}%`,
      category: t("marginsCategory"),
    },
    {
      label: t("assetTurnover"),
      value: formatNumber(data?.assetTurnover || 0),
      category: t("efficiencyCategory"),
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
    <main aria-label="Analytics Dashboard" className="space-y-8 p-4">
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

      <section aria-labelledby="revenue-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <CardTitle className="text-xl font-semibold" id="revenue-section">
            {t("revenueProfitability")}
          </CardTitle>
          <Badge className="w-fit" variant="secondary">
            {t("keyMetrics")}
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueMetrics.map((metric) => (
            <MetricCard
              description={metric.description}
              key={metric.title}
              title={metric.title}
              trend={metric.trend}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="operating-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <CardTitle className="text-xl font-semibold" id="operating-section">
            {t("operatingPerformance")}
          </CardTitle>
          <Badge className="w-fit" variant="outline">
            {t("cashFlow")}
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {operatingMetrics.map((metric) => (
            <MetricCard
              description={metric.description}
              key={metric.title}
              title={metric.title}
              trend={metric.trend}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      {data?.dataQuality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t("dataQuality")}
            </CardTitle>
            <CardDescription>
              Data quality metrics for the selected period
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="font-medium text-sm">{t("totalTransactions")}</p>
                <p className="text-2xl font-bold text-success">
                  {formatNumber(data.dataQuality.totalTransactions)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">{t("validTransactions")}</p>
                <p className="text-2xl font-bold text-info">
                  {formatNumber(data.dataQuality.validTransactions)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">{t("hasInventoryData")}</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${data.dataQuality.hasInventoryData ? "bg-success" : "bg-destructive"}`}
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
                    className={`w-3 h-3 rounded-full ${data.dataQuality.hasExpenseData ? "bg-success" : "bg-destructive"}`}
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

      <div className="mt-6">
        <AIAnalyticsAssistant
          analyticsData={data}
          monthName={monthName}
          timeRange={time_range}
          year={Number(year)}
        />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <CardTitle className="text-xl font-semibold">
            {t("detailedMetrics")}
          </CardTitle>
          <Badge className="w-fit" variant="secondary">
            {t("completeOverview")}
          </Badge>
        </div>
        <MetricsTable
          description={t("financialBreakdownDescription")}
          metrics={allDetailedMetrics}
          title={t("financialBreakdown")}
        />
      </div>
    </main>
  );
};

export default async function AnalyticsPage(
  props: PageProps<"/[locale]/analytics">
) {
  const searchParams = await props.searchParams;
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <Analytics searchParams={searchParams} />
    </Suspense>
  );
}
