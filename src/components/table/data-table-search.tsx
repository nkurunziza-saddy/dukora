"use client";

import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

interface DataTableSearchProps<TData> {
  table: Table<TData>;
  placeholder?: string;
  className?: string;
}

export function DataTableSearch<TData>({
  table,
  placeholder,
  className = "h-8 w-[150px] lg:w-[250px]",
}: DataTableSearchProps<TData>) {
  const t = useTranslations("common");
  return (
    <Input
      placeholder={placeholder ?? t("search")}
      value={table.getState().globalFilter ?? ""}
      onChange={(event) => table.setGlobalFilter(event.target.value)}
      className={className}
    />
  );
}
