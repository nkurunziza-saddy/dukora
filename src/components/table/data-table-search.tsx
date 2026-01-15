"use client";

import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { cn } from "@/lib/utils";

interface DataTableSearchProps<TData> {
  table: Table<TData>;
  placeholder?: string;
  className?: string;
  debounce?: number;
}

export function DataTableSearch<TData>({
  table,
  placeholder,
  className,
  debounce = 300,
}: DataTableSearchProps<TData>) {
  const t = useTranslations("common");
  // Read from table state - it should be controlled via props
  const globalFilter = table.getState().globalFilter ?? "";

  return (
    <DebouncedInput
      className={cn("gap-1.5", className)}
      data-role="table-search-input"
      data-slot="input"
      onChange={(value) => table.setGlobalFilter(String(value))}
      placeholder={placeholder ?? t("search")}
      value={globalFilter}
      debounce={debounce}
    />
  );
}
