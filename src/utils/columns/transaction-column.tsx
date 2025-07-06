"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import {
  ExtendedTransactionPayload,
  TransactionType,
} from "@/lib/schema/schema-types";
import { ArrowDown, ArrowUp, XCircle, Undo2, Redo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TransactionColumn(
  t: (key: string) => string
): ColumnDef<ExtendedTransactionPayload>[] {
  return [
    {
      accessorKey: "product.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("name")} />
      ),
      cell: ({ row }) => row.original.product?.name ?? "",
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("status")} />
      ),
      cell: ({ row }) => {
        const status = transactionStatuses.find(
          (s) => s.value === row.original.type.toLowerCase()
        );
        if (!status) {
          return (
            <Badge variant="outline" className="capitalize">
              <span>{row.original.type}</span>
            </Badge>
          );
        }
        return (
          <Badge
            variant={status.variant}
            className="capitalize flex gap-1 items-center"
          >
            {status.icon && (
              <status.icon className="text-muted-foreground size-4" />
            )}
            <span>{status.label}</span>
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("quantity")} />
      ),
      cell: ({ row }) => row.original.quantity,
    },
    {
      accessorKey: "note",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("note")} />
      ),
      cell: ({ row }) => row.original.note ?? "",
    },
    {
      accessorKey: "reference",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("reference")} />
      ),
      cell: ({ row }) => row.original.reference ?? "",
    },
    {
      accessorKey: "createdByUser.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("createdBy")} />
      ),
      cell: ({ row }) => row.original.createdByUser.name ?? "",
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
  ];
}

export const transactionStatuses = [
  {
    value: TransactionType.PURCHASE,
    label: "Purchase",
    variant: "outline" as "secondary" | "destructive" | "outline",
    icon: ArrowDown,
  },
  {
    value: TransactionType.SALE,
    label: "Sale",
    variant: "secondary" as "secondary" | "destructive" | "outline",
    icon: ArrowUp,
  },
  {
    value: TransactionType.DAMAGE,
    label: "Damage",
    variant: "destructive" as "secondary" | "destructive" | "outline",
    icon: XCircle,
  },
  {
    value: TransactionType.RETURN_SALE,
    label: "Return Sale",
    variant: "secondary" as "secondary" | "destructive" | "outline",
    icon: Undo2,
  },
  {
    value: TransactionType.RETURN_PURCHASE,
    label: "Return Purchase",
    variant: "secondary" as "secondary" | "destructive" | "outline",
    icon: Redo2,
  },
];
