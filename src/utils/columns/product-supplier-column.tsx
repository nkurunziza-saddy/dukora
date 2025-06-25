"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { SelectProductSupplier } from "@/lib/schema/schema-types";

export const ProductSupplierColumn: ColumnDef<SelectProductSupplier>[] = [
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
    accessorKey: "businessId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Business id" />
    ),
  },

  {
    accessorKey: "productId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product id" />
    ),
    cell: ({ row }) => row.original.productId,
  },
  {
    accessorKey: "note",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Note" />
    ),
    cell: ({ row }) => row.original.note,
  },
  {
    accessorKey: "supplierPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SupplierPrice" />
    ),
    cell: ({ row }) => row.original.supplierPrice,
  },
  {
    accessorKey: "leadTimeDays",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="LeadTimeDays" />
    ),
    cell: ({ row }) => row.original.leadTimeDays,
  },
  {
    accessorKey: "isPreferred",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IsPreferred" />
    ),
    cell: ({ row }) => row.original.isPreferred,
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
];
