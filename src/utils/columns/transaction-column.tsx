"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Redo2Icon,
  Undo2Icon,
  XCircleIcon,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import {
  type CompressedTransactionPayload,
  TransactionType,
} from "@/lib/schema/schema-types";
import { AbbreviatedText, MobileResponsive } from "@/utils/mobile-responsive";

export function TransactionColumn(
  t: (key: string) => string
): ColumnDef<CompressedTransactionPayload>[] {
  return [
    {
      accessorKey: "product",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("name")} />
      ),
      cell: ({ row }) => {
        const productName = row.original.product ?? "";
        return (
          <div className="font-medium">
            <AbbreviatedText maxLength={15} text={productName} />
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("type")} />
      ),
      cell: ({ row }) => {
        const status = transactionStatuses.find(
          (s) => s.value === row.original.type.toLowerCase()
        );

        if (!status) {
          return (
            <Badge className="capitalize" variant="outline">
              <span>{row.original.type}</span>
            </Badge>
          );
        }

        // Mobile: Show only icon, Desktop: Show icon + label
        return (
          <MobileResponsive
            desktop={
              <Badge
                className="capitalize flex gap-1 items-center"
                variant={status.variant}
              >
                {status.icon && (
                  <status.icon className="text-muted-foreground size-4" />
                )}
                <span>{status.label}</span>
              </Badge>
            }
            mobile={
              <Badge
                className="capitalize flex gap-1 items-center"
                variant={status.variant}
              >
                {status.icon && (
                  <status.icon className="text-muted-foreground size-4" />
                )}
              </Badge>
            }
          />
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
      accessorKey: "createdByUser",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("createdBy")} />
      ),
      cell: ({ row }) => row.original.createdBy ?? "",
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
    variant: "outline" as "secondary" | "error" | "outline",
    icon: ArrowDownIcon,
  },
  {
    value: TransactionType.SALE,
    label: "Sale",
    variant: "secondary" as "secondary" | "error" | "outline",
    icon: ArrowUpIcon,
  },
  {
    value: TransactionType.DAMAGE,
    label: "Damage",
    variant: "error" as "secondary" | "error" | "outline",
    icon: XCircleIcon,
  },
  {
    value: TransactionType.RETURN_SALE,
    label: "Return Sale",
    variant: "secondary" as "secondary" | "error" | "outline",
    icon: Undo2Icon,
  },
  {
    value: TransactionType.RETURN_PURCHASE,
    label: "Return Purchase",
    variant: "secondary" as "secondary" | "error" | "outline",
    icon: Redo2Icon,
  },
];
