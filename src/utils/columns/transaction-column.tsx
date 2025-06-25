"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { ExtendedTransactionPayload } from "@/lib/schema/schema-types";
import { ArrowDown, ArrowUp, XCircle, Repeat, ArrowLeftRight, Undo2, Redo2, PackagePlus, PackageCheck } from 'lucide-react';
import {Badge} from '@/components/ui/badge';

export const TransactionColumn: ColumnDef<ExtendedTransactionPayload>[] = [
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
    accessorKey: "product.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row }) => row.original.product?.name ?? "",
  },
   {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
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
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
    cell: ({ row }) => row.original.quantity,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => row.original.notes ?? "",
  },
  {
    accessorKey: "reference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reference" />
    ),
    cell: ({ row }) => row.original.reference ?? "",
  },
  {
    accessorKey: "createdByUser.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
    cell: ({ row }) => row.original.createdBy ?? "",
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

export const transactionStatuses = [
  {
    value: "PURCHASE",
    label: "Purchase",
    variant: "outline" as "secondary" | "destructive" | "outline",
    icon: ArrowDown,
  },
  {
    value: "SALE",
    label: "Sale",
    variant: "secondary" as "secondary" | "destructive" | "outline",
    icon: ArrowUp,
  },
  {
    value: "DAMAGE",
    label: "Damage",
    variant: "destructive" as "secondary" | "destructive" | "outline",
    icon: XCircle,
  },
  {
    value: "STOCK_ADJUSTMENT",
    label: "Stock Adjustment",
    variant: "outline" as "secondary" | "destructive" | "outline",
    icon: Repeat,
  },
  {
    value: "TRANSFER_IN",
    label: "Transfer In",
    variant: "outline" as "secondary" | "destructive" | "outline",
    icon: ArrowLeftRight,
  },
  {
    value: "TRANSFER_OUT",
    label: "Transfer Out",
    variant: "outline" as "secondary" | "destructive" | "outline",
    icon: ArrowLeftRight,
  },
  {
    value: "RETURN_SALE",
    label: "Return Sale",
    variant: "secondary" as "secondary" | "destructive" | "outline",
    icon: Undo2,
  },
  {
    value: "RETURN_PURCHASE",
    label: "Return Purchase",
    variant: "secondary" as "secondary" | "destructive" | "outline",
    icon: Redo2,
  },
  {
    value: "PRODUCTION_INPUT",
    label: "Production Input",
    variant: "outline" as "secondary" | "destructive" | "outline",
    icon: PackagePlus,
  },
  {
    value: "PRODUCTION_OUTPUT",
    label: "Production Output",
    variant: "outline" as "secondary" | "destructive" | "outline",
    icon: PackageCheck,
  },
];