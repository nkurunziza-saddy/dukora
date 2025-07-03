import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { SelectInterBusinessPayment } from "@/lib/schema/schema-types";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

export const InterBusinessPaymentsDataTable = ({
  data,
}: {
  data: SelectInterBusinessPayment[];
}) => {
  const t = useTranslations("payments");

  const columns: ColumnDef<SelectInterBusinessPayment>[] = [
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

  return <DataTable columns={columns} data={data} />;
};
