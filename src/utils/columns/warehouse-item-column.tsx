"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { ExtendedWarehouseItemPayload } from "@/lib/schema/schema-types";

export function WarehouseItemColumn(
  t: (key: string) => string,
): ColumnDef<ExtendedWarehouseItemPayload & { productCount: number }>[] {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) =>
        row.getCanExpand() ? (
          <button
            {...{
              onClick: row.getToggleExpandedHandler(),
              style: { cursor: "pointer" },
              className: "self-center",
              "aria-label": row.getIsExpanded() ? "Collapse" : "Expand",
            }}
          >
            {row.getIsExpanded() ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        ) : null,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "productCount",
      header: () => (
        <span className="text-xs text-muted-foreground">{t("products")}</span>
      ),
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="text-xs font-medium bg-muted/60 text-foreground"
        >
          {row.original.productCount}
        </Badge>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "product.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("productName")} />
      ),
      cell: ({ row }) => row.original.product?.name ?? "",
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("quantity")} />
      ),
    },
    {
      accessorKey: "reservedQty",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("reservedQty")} />
      ),
    },
    {
      accessorKey: "lastUpdated",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("lastUpdated")} />
      ),
      cell: ({ row }) => {
        const date = row.original.lastUpdated
          ? new Date(row.original.lastUpdated)
          : null;
        return date ? format(date, "MMM dd, yyyy") : null;
      },
    },
  ];
}
