"use client";

import type { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateSupplierDialog } from "@/components/forms/create-supplier-form";
import { DataTableExportPDF } from "@/components/table/data-table-export-pdf";
import { DataTableSearch } from "@/components/table/data-table-search";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function SuppliersDataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const t = useTranslations("table");
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <DataTableSearch table={table} placeholder="Filter suppliers..." />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            {t("reset")}
            <XIcon />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableExportPDF
          table={table}
          filename="suppliers_export"
          title="Suppliers Report"
        />
        <DataTableViewOptions table={table} />
        <CreateSupplierDialog />
      </div>
    </div>
  );
}
