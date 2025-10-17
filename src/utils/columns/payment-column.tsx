"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { SelectInterBusinessPayment } from "@/lib/schema/schema-types";

export function PaymentColumn(
  t: (key: string) => string,
): ColumnDef<SelectInterBusinessPayment>[] {
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
        return `${row.original.amount} ${row.original.currency}`;
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
