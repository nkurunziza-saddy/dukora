import { TrendingUp, ShoppingCart, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { getTodayTransactions } from "@/server/actions/statistics-actions";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { TransactionColumn } from "@/utils/columns/transaction-column";
import { getTransactionsByTimeInterval } from "@/server/actions/transaction-actions";
import StatCard from "@/components/shared/stat-card";
import { subDays } from "date-fns";

export default async function SalesTracking() {
  const t = await getTranslations("sales");
  const statData = await getTodayTransactions();
  const transactions = await getTransactionsByTimeInterval(
    subDays(new Date(), 7),
    new Date()
  );

  const salesStatsData = [
    {
      title: t("todaysSales"),
      subText: t("saleFromYesterday"),
      value: statData.data?.current?.totalSales ?? 0,
      icon: ShoppingCart,
    },
    {
      title: t("todayExpenses"),
      subText: t("saleFromYesterday"),
      value: statData.data?.current?.totalExpenses ?? 0,
      icon: DollarSign,
    },
    {
      title: t("todaysProfit"),
      subText: t("profitFromYesterday"),
      value: statData.data?.current?.netProfit ?? 0,
      icon: DollarSign,
    },
    {
      title: t("transactionCount"),
      subText: t("transactionFromYesterday"),
      value: statData.data?.current?.transactionCount ?? 0,
      icon: TrendingUp,
    },
  ];

  if (statData.error || !transactions.data) {
    throw new Error("Stat fetching error");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {salesStatsData.map((item) => (
          <StatCard
            key={`${item.title}-${item.subText}`}
            icon={item.icon}
            subText={item.subText}
            title={item.title}
            value={item.value}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("dailySalesRevenue")}</CardTitle>
              <CardDescription>{t("revenueTrends7Days")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ColumnWrapper
            column={TransactionColumn}
            data={transactions.data}
            tag="transactions"
          />
        </CardContent>
      </Card>
    </div>
  );
}
