"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

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
