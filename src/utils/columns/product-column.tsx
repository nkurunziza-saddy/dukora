"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Circle, Timer } from "lucide-react";
// import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import ProductRowActions from "@/components/table/product-row-actions";
import { SelectProduct, ProductStatus } from "@/lib/schema/schema-types";
// import { Button } from "@/components/ui/button";

export function ProductColumn(
  t: (key: string) => string
): ColumnDef<SelectProduct>[] {
  return [
    // {
    //   id: "expander",
    //   header: () => null,
    //   cell: ({ row }) => {
    //     return row.getCanExpand() ? (
    //       <Button
    //         {...{
    //           className: "size-7 shadow-none text-muted-foreground",
    //           onClick: row.getToggleExpandedHandler(),
    //           "aria-expanded": row.getIsExpanded(),
    //           "aria-label": row.getIsExpanded()
    //             ? `Collapse details for ${row.original.description}`
    //             : `Expand details for ${row.original.description}`,
    //           size: "icon",
    //           variant: "ghost",
    //         }}
    //       >
    //         {row.getIsExpanded() ? (
    //           <ChevronUpIcon
    //             className="opacity-60"
    //             size={16}
    //             aria-hidden="true"
    //           />
    //         ) : (
    //           <ChevronDownIcon
    //             className="opacity-60"
    //             size={16}
    //             aria-hidden="true"
    //           />
    //         )}
    //       </Button>
    //     ) : undefined;
    //   },
    // },
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && "indeterminate")
    //       }
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
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
    variant: "outline" as "secondary" | "destructive" | "outline",
    icon: Circle,
  },
  {
    value: ProductStatus.INACTIVE,
    label: "Inactive",
    variant: "secondary" as "secondary" | "destructive" | "outline",
    icon: Timer,
  },
  {
    value: ProductStatus.DISCONTINUED,
    label: "Discontinued",
    variant: "destructive" as "secondary" | "destructive" | "outline",
    icon: Circle,
  },
];
