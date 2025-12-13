"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CheckCircle,
  CircleIcon,
  PackageCheckIcon,
  TimerIcon,
  TruckIcon,
  Undo2Icon,
  XCircleIcon,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import OrdersRowActions from "@/components/table/orders/orders-row-actions";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/hooks/use-currency";
import { ORDER_STATUS } from "@/lib/schema/models/enums";
import type { SelectPurchaseOrder } from "@/lib/schema/schema.types";

export function OrderColumn(
  t: (key: string) => string
): ColumnDef<SelectPurchaseOrder>[] {
  const { formatWithCode } = useCurrency();
  return [
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("status")} />
      ),
      cell: ({ row }) => {
        const status = orderStatuses.find(
          (s) => s.value === row.original.status
        );
        if (!status) {
          return (
            <Badge className="capitalize" variant="outline">
              <span>{row.original.status}</span>
            </Badge>
          );
        }
        return (
          <Badge
            className="capitalize flex w-fit px-0.5 gap-1 items-center"
            variant={status.variant}
          >
            {status.icon && (
              <status.icon className="text-muted-foreground size-3.5" />
            )}
            <span className="text-sm">{status.label}</span>
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "orderNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("orderNumber")} />
      ),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("totalAmount")} />
      ),
      cell: ({ row }) => formatWithCode(row.original.totalAmount),
    },
    {
      accessorKey: "supplierId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("supplier")} />
      ),
    },
    {
      accessorKey: "orderDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("orderDate")} />
      ),
      cell: ({ row }) => {
        const date = row.original.orderDate
          ? new Date(row.original.orderDate)
          : null;
        return date ? format(date, "MMM dd, yyyy") : null;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("createdAt")} />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt
          ? new Date(row.original.createdAt)
          : null;
        return date ? format(date, "MMM dd, yyyy") : null;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <OrdersRowActions order={row.original} />,
    },
  ];
}

export const orderStatuses = [
  {
    value: ORDER_STATUS[0], // DRAFT
    label: "Draft",
    variant: "outline" as "secondary" | "error" | "outline" | "default",
    icon: CircleIcon,
  },
  {
    value: ORDER_STATUS[1], // CONFIRMED
    label: "Confirmed",
    variant: "outline" as "secondary" | "error" | "outline" | "default",
    icon: CheckCircle,
  },
  {
    value: ORDER_STATUS[2], // PROCESSING
    label: "Processing",
    variant: "outline" as "secondary" | "error" | "outline" | "default",
    icon: TimerIcon,
  },
  {
    value: ORDER_STATUS[3], // SHIPPED
    label: "Shipped",
    variant: "outline" as "secondary" | "error" | "outline" | "default",
    icon: TruckIcon,
  },
  {
    value: ORDER_STATUS[4], // DELIVERED
    label: "Delivered",
    variant: "default" as "secondary" | "error" | "outline" | "default",
    icon: PackageCheckIcon,
  },
  {
    value: ORDER_STATUS[5], // CANCELLED
    label: "Cancelled",
    variant: "error" as "secondary" | "error" | "outline" | "default",
    icon: XCircleIcon,
  },
  {
    value: ORDER_STATUS[6], // RETURNED
    label: "Returned",
    variant: "error" as "secondary" | "error" | "outline" | "default",
    icon: Undo2Icon,
  },
];
