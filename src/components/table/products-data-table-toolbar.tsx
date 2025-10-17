"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateProductDialog } from "@/components/forms/create-product-form";
import { DataTableExportPDF } from "@/components/table/data-table-export-pdf";
import { DataTableSearch } from "@/components/table/data-table-search";
import { Button } from "@/components/ui/button";
import { productStatuses } from "@/utils/columns/product-column";
import { DataTableDashFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function ProductsDataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const t = useTranslations("table");
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <DataTableSearch table={table} placeholder="Filter products..." />
        {table.getColumn("status") && (
          <DataTableDashFilter
            column={table.getColumn("status")}
            title="Status"
            options={productStatuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            {t("reset")}
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableExportPDF
          table={table}
          filename="products_export"
          title="Products Report"
        />
        <DataTableViewOptions table={table} />
        <CreateProductDialog />
      </div>
    </div>
  );
}
