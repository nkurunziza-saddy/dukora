"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Circle, Timer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import ProductRowActions from "@/components/table/product-row-actions";
import type { SelectProduct } from "@/lib/schema/schema-types";

export const ProductColumn: ColumnDef<SelectProduct>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = productStatuses.find(
        (s) => s.value === row.original.status.toLowerCase()
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
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "sku",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SKU" />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => row.original.price,
  },
  {
    accessorKey: "costPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost Price" />
    ),
    cell: ({ row }) => row.original.costPrice,
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit" />
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reorder Point" />
    ),
    cell: ({ row }) => row.original.reorderPoint,
  },
  {
    accessorKey: "maxStock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Max Stock" />
    ),
    cell: ({ row }) => row.original.maxStock,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
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

export const productStatuses = [
  {
    value: "active",
    label: "Active",
    variant: "outline" as "secondary" | "destructive" | "outline",
    icon: Circle,
  },
  {
    value: "inactive",
    label: "Inactive",
    variant: "secondary" as "secondary" | "destructive" | "outline",
    icon: Timer,
  },
  {
    value: "discontinued",
    label: "Discontinued",
    variant: "destructive" as "secondary" | "destructive" | "outline",
    icon: Circle,
  },
];
