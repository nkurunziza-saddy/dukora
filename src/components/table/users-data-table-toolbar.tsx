"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableDashFilter } from "./data-table-faceted-filter";
import { DataTableSearch } from "@/components/table/data-table-search";
import { DataTableExportPDF } from "@/components/table/data-table-export-pdf";
import { userStatuses } from "@/utils/columns/user-column";
import { useTranslations } from "next-intl";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function UsersDataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const t = useTranslations("table");
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <DataTableSearch table={table} placeholder="Filter users..." />
        {table.getColumn("role") && (
          <DataTableDashFilter
            column={table.getColumn("role")}
            title="Role"
            options={userStatuses}
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
          filename="users_export"
          title="Users Report"
        />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
