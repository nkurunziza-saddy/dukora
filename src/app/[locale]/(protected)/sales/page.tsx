import { subDays } from "date-fns";
import { DollarSignIcon, ShoppingCartIcon, TrendingUpIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ColumnWrapper from "@/components/providers/column-wrapper";
import StatCard from "@/components/shared/stat-card";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getBusinessSettings } from "@/server/actions/business-settings-actions";
import { getTodayTransactions } from "@/server/actions/statistics-actions";
import { getTransactionsByTimeIntervalPaginated } from "@/server/actions/transaction-actions";
import { TransactionColumn } from "@/utils/columns/transaction-column";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "sales",
  });
}

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
  const settings = await getBusinessSettings({});
  const currency =
    (settings.data?.find((s) => s.key === "currency")?.value as string) ||
    "USD";

  const salesStatsData = [
    {
      title: t("todaysSales"),
      subText: t("saleFromYesterday"),
      value: formatCurrency(statData.data?.current?.totalSales ?? 0, currency),
      icon: ShoppingCartIcon,
    },
    {
      title: t("todayExpenses"),
      subText: t("saleFromYesterday"),
      value: formatCurrency(
        statData.data?.current?.totalExpenses ?? 0,
        currency
      ),
      icon: DollarSignIcon,
    },
    {
      title: t("todaysProfit"),
      subText: t("profitFromYesterday"),
      value: formatCurrency(statData.data?.current?.netProfit ?? 0, currency),
      icon: DollarSignIcon,
    },
    {
      title: t("transactionCount"),
      subText: t("transactionFromYesterday"),
      value: formatNumber(statData.data?.current?.transactionCount ?? 0),
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
            icon={item.icon}
            key={`${item.title}-${item.subText}`}
            subText={item.subText}
            title={item.title}
            value={item.value}
          />
        ))}
      </div>

      <div>
        <div className="head">
          <h1>{t("weeklySalesRevenue")}</h1>
          <p>{t("revenueTrends7Days")}</p>
        </div>
        <div className="px-0">
          <ColumnWrapper
            column={TransactionColumn}
            data={transactionsData.data.result}
            page={page}
            pageSize={pageSize}
            tag="transactions"
            totalCount={transactionsData.data.totalCount}
          />
        </div>
      </div>
    </div>
  );
}
