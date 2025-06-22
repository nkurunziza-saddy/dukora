"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableDashFilter } from "./data-table-faceted-filter";
import { bookStatuses } from "@/utils/columns/books";
import { CreateBookDialog } from "@/components/forms/create-book";
import { DataTableSearch } from "@/components/table/data-table-search";
import { DataTableExportPDF } from "@/components/table/data-table-export-pdf";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function BooksDataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <DataTableSearch table={table} placeholder="Filter books..." />
        {table.getColumn("status") && (
          <DataTableDashFilter
            column={table.getColumn("status")}
            title="Status"
            options={bookStatuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableExportPDF
          table={table}
          filename="books_export"
          title="Books Report"
        />
        <DataTableViewOptions table={table} />
        <CreateBookDialog />
      </div>
    </div>
  );
}
