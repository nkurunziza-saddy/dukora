import { TimeRange } from "@/components/time-range";
import { calculateAndSyncMonthlyMetrics } from "@/server/actions/metrics-action";
import { getMonthData } from "@/server/helpers/time-date-forrmatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Calculator,
  Wallet,
} from "lucide-react";
import StatCard from "@/components/shared/stat-card";
import { getTranslations } from "next-intl/server";
import { formatCurrency, formatNumber } from "@/lib/utils";

const analytics = async (props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const time_range = (searchParams.t as string) || "1";
  const { date, monthName, year } = getMonthData(Number(time_range));
  const metrics = await calculateAndSyncMonthlyMetrics(date);
  const t = await getTranslations("analytics");

  const revenueMetrics = [
    {
      title: t("totalRevenue"),
      value: formatCurrency(metrics.data?.grossRevenue),
      icon: DollarSign,
    },
    {
      title: t("netRevenue"),
      value: formatCurrency(metrics.data?.netRevenue),
      icon: TrendingUp,
    },
    {
      title: t("grossProfit"),
      value: formatCurrency(metrics.data?.grossProfit),
      icon: BarChart3,
    },
    {
      title: t("netIncome"),
      value: formatCurrency(metrics.data?.netIncome),
      icon: Wallet,
    },
  ];

  const operatingMetrics = [
    {
      title: t("operatingIncome"),
      value: formatCurrency(metrics.data?.operatingIncome),
      icon: Calculator,
    },
  ];

  const detailedMetrics = [
    {
      label: t("returns"),
      value: formatNumber(metrics.data?.returns),
      category: t("salesCategory"),
    },
    {
      label: t("averageOrderValue"),
      value: formatCurrency(metrics.data?.averageOrderValue),
      category: t("salesCategory"),
    },
    {
      label: t("transactionCount"),
      value: formatNumber(metrics.data?.transactionCount),
      category: t("salesCategory"),
    },
    {
      label: t("openingStock"),
      value: formatCurrency(metrics.data?.openingStock),
      category: t("inventoryCategory"),
    },
    {
      label: t("closingStock"),
      value: formatCurrency(metrics.data?.closingStock),
      category: t("inventoryCategory"),
    },
    {
      label: t("purchases"),
      value: formatCurrency(metrics.data?.purchases),
      category: t("inventoryCategory"),
    },
    {
      label: t("costOfGoodsSold"),
      value: formatCurrency(metrics.data?.costOfGoodsSold),
      category: t("inventoryCategory"),
    },
    {
      label: t("averageInventory"),
      value: formatCurrency(metrics.data?.averageInventory),
      category: t("inventoryCategory"),
    },
    {
      label: t("inventoryTurnover"),
      value: formatNumber(metrics.data?.inventoryTurnover),
      category: t("ratiosCategory"),
    },
    {
      label: t("daysOnHand"),
      value: formatNumber(metrics.data?.daysOnHand),
      category: t("ratiosCategory"),
    },
    // {
    //   label: t("totalExpenses"),
    //   value: formatCurrency(metrics.data?.),
    //   category: t("expensesCategory"),
    // },
    {
      label: t("operatingExpenses"),
      value: formatCurrency(metrics.data?.operatingExpenses),
      category: t("expensesCategory"),
    },
    {
      label: t("grossMargin"),
      value: `${metrics.data?.grossMargin ?? 0}%`,
      category: t("marginsCategory"),
    },
    {
      label: t("netMargin"),
      value: `${metrics.data?.netMargin ?? 0}%`,
      category: t("marginsCategory"),
    },
    {
      label: t("operatingMargin"),
      value: `${metrics.data?.operatingMargin ?? 0}%`,
      category: t("marginsCategory"),
    },
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
              />
            );
          })}
        </div>
      </div>

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
          <CardContent>
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
                {detailedMetrics.map((metric, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {metric.label}
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
                            : "orange"
                        }
                      >
                        {metric.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {metric.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default analytics;
