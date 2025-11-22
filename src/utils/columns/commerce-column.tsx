"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CircleIcon, TimerIcon } from "lucide-react";
import CommerceRowActions from "@/components/table/commerce/commerce-row-actions";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/hooks/use-currency";
import { ProductStatus, type SelectProduct } from "@/lib/schema/schema-types";

export function CommerceColumn(
  t: (key: string) => string
): ColumnDef<SelectProduct>[] {
  const { formatCurrency } = useCurrency();
  return [
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("status")} />
      ),
      cell: ({ row }) => {
        const status = productStatuses.find(
          (s) => s.value === row.original.status.toLowerCase()
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
            className="capitalize flex gap-1 items-center"
            variant={status.variant}
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("name")} />
      ),
    },
    {
      accessorKey: "sku",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("SKU")} />
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("price")} />
      ),
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      accessorKey: "costPrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("costPrice")} />
      ),
      cell: ({ row }) => formatCurrency(row.original.costPrice),
    },
    {
      accessorKey: "unit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("unit")} />
      ),
    },
    {
      accessorKey: "reorderPoint",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("reorderPoint")} />
      ),
      cell: ({ row }) => row.original.reorderPoint,
    },
    {
      accessorKey: "maxStock",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("maxStock")} />
      ),
      cell: ({ row }) => row.original.maxStock,
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
      cell: ({ row }) => <CommerceRowActions product={row.original} />,
    },
  ];
}

export const productStatuses = [
  {
    value: ProductStatus.ACTIVE,
    label: "Active",
    variant: "outline" as "secondary" | "error" | "outline",
    icon: CircleIcon,
  },
  {
    value: ProductStatus.INACTIVE,
    label: "Inactive",
    variant: "secondary" as "secondary" | "error" | "outline",
    icon: TimerIcon,
  },
  {
    value: ProductStatus.DISCONTINUED,
    label: "Discontinued",
    variant: "error" as "secondary" | "error" | "outline",
    icon: CircleIcon,
  },
];
