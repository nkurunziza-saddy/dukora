"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CircleIcon, TimerIcon } from "lucide-react";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import ProductRowActions from "@/components/table/product-row-actions";
import { Badge } from "@/components/ui/badge";
import { ProductStatus, type SelectProduct } from "@/lib/schema/schema-types";

export function ProductColumn(
  t: (key: string) => string,
): ColumnDef<SelectProduct>[] {
  return [
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("status")} />
      ),
      cell: ({ row }) => {
        const status = productStatuses.find(
          (s) => s.value === row.original.status.toLowerCase(),
        );
        if (!status) {
          return (
            <Badge variant="outline" className="capitalize">
              <span>{row.original.status}</span>
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
      cell: ({ row }) => row.original.price,
    },
    {
      accessorKey: "costPrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("costPrice")} />
      ),
      cell: ({ row }) => row.original.costPrice,
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
      cell: ({ row }) => <ProductRowActions product={row.original} />,
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
