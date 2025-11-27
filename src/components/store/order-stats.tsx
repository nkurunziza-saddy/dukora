"use client";

import { PackageIcon, ShoppingCartIcon, WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/lib/hooks/use-currency";

interface OrderStatsProps {
  totalOrders: number;
  totalSpent: string;
  pendingOrders: number;
}

export function OrderStats({
  totalOrders,
  totalSpent,
  pendingOrders,
}: OrderStatsProps) {
  const t = useTranslations("store.orders");
  const { formatWithCode } = useCurrency();

  const stats = [
    {
      label: t("totalOrders"),
      value: totalOrders,
      icon: PackageIcon,
    },
    {
      label: t("totalSpent"),
      value: formatWithCode(parseFloat(totalSpent)),
      icon: WalletIcon,
    },
    {
      label: t("pendingOrders"),
      value: pendingOrders,
      icon: ShoppingCartIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border/2">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div className="bg-background p-6" key={index}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-semibold mt-2">{stat.value}</p>
              </div>
              {/* <Icon className="h-6 w-6 text-muted-foreground" /> */}
            </div>
          </div>
        );
      })}
    </div>
  );
}
