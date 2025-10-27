"use client";

import type { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DefaultDataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const t = useTranslations("table");
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
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
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
