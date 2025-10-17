"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { SelectWarehouse } from "@/lib/schema/schema-types";

export function WarehouseColumn(
  t: (key: string) => string,
): ColumnDef<SelectWarehouse & { warehouseItemCount: number }>[] {
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
      id: "warehouseItemCount",
      header: () => (
        <span className="text-xs text-muted-foreground">{t("items")}</span>
      ),
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="text-xs font-medium bg-muted/60 text-foreground"
        >
          {row.original.warehouseItemCount}
        </Badge>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("name")} />
      ),
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("code")} />
      ),
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("address")} />
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("isActive")} />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "outline" : "error"}>
          {row.original.isActive ? t("active") : t("inactive")}
        </Badge>
      ),
    },
    {
      accessorKey: "isDefault",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("isDefault")} />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isDefault ? "outline" : "secondary"}>
          {row.original.isDefault ? t("default") : ""}
        </Badge>
      ),
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
