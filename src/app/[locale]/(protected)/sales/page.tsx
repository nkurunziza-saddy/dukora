import { subDays } from "date-fns";
import { DollarSignIcon, ShoppingCartIcon, TrendingUpIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ColumnWrapper from "@/components/providers/column-wrapper";
import StatCard from "@/components/shared/stat-card";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { getTodayTransactions } from "@/server/actions/statistics-actions";
import { getTransactionsByTimeIntervalPaginated } from "@/server/actions/transaction-actions";
import { TransactionColumn } from "@/utils/columns/transaction-column";

export default async function SalesTracking(
  props: PageProps<"/[locale]/sales">
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const t = await getTranslations("sales");
  const statData = await getTodayTransactions({});
  const transactionsData = await getTransactionsByTimeIntervalPaginated({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
    page,
    pageSize,
  });

  const salesStatsData = [
    {
      title: t("todaysSales"),
      subText: t("saleFromYesterday"),
      value: statData.data?.current?.totalSales ?? 0,
      icon: ShoppingCartIcon,
    },
    {
      title: t("todayExpenses"),
      subText: t("saleFromYesterday"),
      value: statData.data?.current?.totalExpenses ?? 0,
      icon: DollarSignIcon,
    },
    {
      title: t("todaysProfit"),
      subText: t("profitFromYesterday"),
      value: statData.data?.current?.netProfit ?? 0,
      icon: DollarSignIcon,
    },
    {
      title: t("transactionCount"),
      subText: t("transactionFromYesterday"),
      value: statData.data?.current?.transactionCount ?? 0,
      icon: TrendingUpIcon,
    },
  ];

  if (statData.error || !transactionsData.data) {
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

      <Card className="bg-transparent border-0 px-0">
        <CardHeader className="px-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("weeklySalesRevenue")}</CardTitle>
              <CardDescription>{t("revenueTrends7Days")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardPanel className="px-0">
          <ColumnWrapper
            column={TransactionColumn}
            data={transactionsData.data.result}
            tag="transactions"
            page={page}
            pageSize={pageSize}
            totalCount={transactionsData.data.totalCount}
          />
        </CardPanel>
      </Card>
    </div>
  );
}
