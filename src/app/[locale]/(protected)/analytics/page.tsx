import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calculator,
  CheckCircle,
  DollarSign,
  Info,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatKeys, formatNumber } from "@/lib/utils";
import { calculateAndSyncMonthlyMetrics } from "@/server/actions/metrics-action";
import {
  getCurrentMonthBoundary,
  getMonthData,
} from "@/server/helpers/time-date-forrmatters";

const analytics = async (props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const time_range = (searchParams.t as string) || "0";
  const { date, monthName, year } = getMonthData(Number(time_range));

  const currentBoundary = getCurrentMonthBoundary();
  const analysisDate = date > currentBoundary ? currentBoundary : date;

  const metrics = await calculateAndSyncMonthlyMetrics(analysisDate);
  const t = await getTranslations("analytics");

  if (metrics.error) {
    return (
      <Alert variant="error">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{formatKeys(metrics.error)}</AlertDescription>
      </Alert>
    );
  }

  const data = metrics.data;

  const revenueMetrics = [
    {
      title: t("totalRevenue"),
      value: formatCurrency(data?.grossRevenue || 0),
      icon: DollarSign,
      trend: data?.grossRevenue && data.grossRevenue > 0 ? "up" : "neutral",
      description: t("totalRevenueDesc"),
    },
    {
      title: t("netRevenue"),
      value: formatCurrency(data?.netRevenue || 0),
      icon: TrendingUp,
      trend: data?.netRevenue && data.netRevenue > 0 ? "up" : "neutral",
      description: t("netRevenueDesc"),
    },
    {
      title: t("grossProfit"),
      value: formatCurrency(data?.grossProfit || 0),
      icon: BarChart3,
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
      icon: Wallet,
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
      icon: Calculator,
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
      icon: TrendingDown,
      trend: "neutral",
      description: t("operatingExpensesDesc"),
    },
    {
      title: t("expenseRatio"),
      value: `${data?.expenseRatio || 0}%`,
      icon: BarChart3,
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
      icon: ShoppingCart,
    },
    {
      label: t("averageOrderValue"),
      value: formatCurrency(data?.averageOrderValue || 0),
      category: t("salesCategory"),
      icon: DollarSign,
    },
    {
      label: t("uniqueProductsSold"),
      value: formatNumber(data?.uniqueProductsSold || 0),
      category: t("salesCategory"),
      icon: Package,
    },
    {
      label: t("returns"),
      value: formatCurrency(data?.returns || 0),
      category: t("salesCategory"),
      icon: TrendingDown,
    },
    {
      label: t("returnRate"),
      value: `${data?.returnRate || 0}%`,
      category: t("salesCategory"),
      icon: AlertTriangle,
    },
  ];

  const inventoryMetrics = [
    {
      label: t("openingStock"),
      value: formatCurrency(data?.openingStock || 0),
      category: t("inventoryCategory"),
      icon: Package,
    },
    {
      label: t("closingStock"),
      value: formatCurrency(data?.closingStock || 0),
      category: t("inventoryCategory"),
      icon: Package,
    },
    {
      label: t("purchases"),
      value: formatCurrency(data?.purchases || 0),
      category: t("inventoryCategory"),
      icon: ShoppingCart,
    },
    {
      label: t("costOfGoodsSold"),
      value: formatCurrency(data?.costOfGoodsSold || 0),
      category: t("inventoryCategory"),
      icon: Calculator,
    },
    {
      label: t("inventoryTurnover"),
      value: formatNumber(data?.inventoryTurnover || 0),
      category: t("inventoryCategory"),
      icon: TrendingUp,
    },
    {
      label: t("daysOnHand"),
      value: `${data?.daysOnHand || 0} days`,
      category: t("inventoryCategory"),
      icon: Info,
    },
    {
      label: t("inventoryGrowth"),
      value: `${data?.inventoryGrowth || 0}%`,
      category: t("inventoryCategory"),
      icon:
        data?.inventoryGrowth && data.inventoryGrowth > 0
          ? TrendingUp
          : TrendingDown,
    },
  ];

  const profitabilityMetrics = [
    {
      label: t("grossMargin"),
      value: `${data?.grossMargin || 0}%`,
      category: t("marginsCategory"),
      icon: BarChart3,
    },
    {
      label: t("netMargin"),
      value: `${data?.netMargin || 0}%`,
      category: t("marginsCategory"),
      icon: BarChart3,
    },
    {
      label: t("operatingMargin"),
      value: `${data?.operatingMargin || 0}%`,
      category: t("marginsCategory"),
      icon: BarChart3,
    },
    {
      label: t("assetTurnover"),
      value: formatNumber(data?.assetTurnover || 0),
      category: t("efficiencyCategory"),
      icon: TrendingUp,
    },
  ];

  const allDetailedMetrics = [
    ...salesMetrics,
    ...inventoryMetrics,
    ...profitabilityMetrics,
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="">
          <h1 className="font-medium tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("description")}: {monthName} {year}
          </p>
        </div>
        <TimeRange />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CardTitle>{t("revenueProfitability")}</CardTitle>
          <Badge variant="secondary">{t("keyMetrics")}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CardTitle>{t("operatingPerformance")}</CardTitle>
          <Badge variant="outline">{t("cashFlow")}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Data Quality Indicator */}
      {data?.dataQuality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t("dataQuality")}
            </CardTitle>
          </CardHeader>
          <CardPanel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">{t("totalTransactions")}</p>
                <p className="text-muted-foreground">
                  {data.dataQuality.totalTransactions}
                </p>
              </div>
              <div>
                <p className="font-medium">{t("validTransactions")}</p>
                <p className="text-muted-foreground">
                  {data.dataQuality.validTransactions}
                </p>
              </div>
              <div>
                <p className="font-medium">{t("hasInventoryData")}</p>
                <p className="text-muted-foreground">
                  {data.dataQuality.hasInventoryData ? t("yes") : t("no")}
                </p>
              </div>
              <div>
                <p className="font-medium">{t("hasExpenseData")}</p>
                <p className="text-muted-foreground">
                  {data.dataQuality.hasExpenseData ? t("yes") : t("no")}
                </p>
              </div>
            </div>
          </CardPanel>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CardTitle>{t("detailedMetrics")}</CardTitle>
          <Badge variant="secondary">{t("completeOverview")}</Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("financialBreakdown")}</CardTitle>
            <CardDescription>
              {t("financialBreakdownDescription")}
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">{t("metric")}</TableHead>
                  <TableHead className="font-semibold">
                    {t("category")}
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    {t("value")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allDetailedMetrics.map((metric) => {
                  const IconComponent = metric.icon || Info;
                  return (
                    <TableRow key={metric.label} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          {metric.label}
                        </div>
                      </TableCell>
                      <TableCell>
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
                        >
                          {metric.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {metric.value}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardPanel>
        </Card>
      </div>
    </div>
  );
};

export default analytics;
