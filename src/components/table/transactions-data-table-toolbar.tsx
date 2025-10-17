"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DataTableExportPDF } from "@/components/table/data-table-export-pdf";
import { DataTableSearch } from "@/components/table/data-table-search";
import { Button } from "@/components/ui/button";
import { transactionStatuses } from "@/utils/columns/transaction-column";
import { DataTableDashFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function TransactionsDataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const t = useTranslations("table");
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <DataTableSearch table={table} placeholder="Filter transactions..." />
        {table.getColumn("type") && (
          <DataTableDashFilter
            column={table.getColumn("type")}
            title="Type"
            options={transactionStatuses}
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
          filename="transactions_export"
          title="Transactions Report"
        />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
