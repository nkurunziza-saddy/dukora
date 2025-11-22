"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useCurrency } from "@/lib/hooks/use-currency";
import type { SelectInterBusinessPayment } from "@/lib/schema/schema-types";

export function PaymentColumn(
  t: (key: string) => string,
): ColumnDef<SelectInterBusinessPayment>[] {
  const { formatCurrency } = useCurrency();
  return [
    {
      accessorKey: "id",
      header: t("transactionId"),
    },
    {
      accessorKey: "payerBusinessId",
      header: t("payerBusiness"),
      cell: ({ row }) => {
        return row.original.payerBusinessId;
      },
    },
    {
      accessorKey: "receiverBusinessId",
      header: t("receiverBusiness"),
      cell: ({ row }) => {
        return row.original.receiverBusinessId;
      },
    },
    {
      accessorKey: "amount",
      header: t("amount"),
      cell: ({ row }) => {
        return formatCurrency(row.original.amount);
      },
    },
    {
      accessorKey: "status",
      header: t("status"),
    },
    {
      accessorKey: "createdAt",
      header: t("date"),
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), "PPP");
      },
    },
    {
      accessorKey: "stripeChargeId",
      header: t("stripeChargeId"),
    },
    {
      accessorKey: "stripePaymentIntentId",
      header: t("stripePaymentIntentId"),
    },
  ];
}
