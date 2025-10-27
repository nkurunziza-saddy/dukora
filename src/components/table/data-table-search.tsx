"use client";

import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface DataTableSearchProps<TData> {
  table: Table<TData>;
  placeholder?: string;
  className?: string;
}

export function DataTableSearch<TData>({
  table,
  placeholder,
  className,
}: DataTableSearchProps<TData>) {
  const t = useTranslations("common");
  return (
    <input
      className={cn(
        "w-[120px] rounded-lg border border-input bg-background text-base/5 ring-ring/24 has-focus-visible:border-ring has-focus-visible:ring-[3px] h-7 px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] outline-none placeholder:text-muted-foreground/64 sm:text-sm dark:bg-input/32 outline-0 shadow-none sm:w-[150px] lg:w-[250px] gap-1.5",
        className
      )}
      data-role="table-search-input"
      data-slot="input"
      onChange={(event) => table.setGlobalFilter(event.target.value)}
      placeholder={placeholder ?? t("search")}
      value={table.getState().globalFilter ?? ""}
    />
  );
}
