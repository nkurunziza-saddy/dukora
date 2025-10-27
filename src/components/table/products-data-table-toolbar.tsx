"use client";

import type { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <DataTableSearch placeholder="Filter products..." table={table} />
        {table.getColumn("status") && (
          <DataTableDashFilter
            column={table.getColumn("status")}
            options={productStatuses}
            title="Status"
          />
        )}
        {isFiltered && (
          <Button
            className="flex items-center gap-1"
            onClick={() => table.resetColumnFilters()}
            size="sm"
            variant="ghost"
          >
            <span className="hidden sm:inline">{t("reset")}</span>
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <DataTableExportPDF
          filename="products_export"
          table={table}
          title="Products Report"
        />
        <DataTableViewOptions table={table} />
        <CreateProductDialog />
      </div>
    </div>
  );
}
