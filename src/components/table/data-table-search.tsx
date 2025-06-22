"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";

interface DataTableSearchProps<TData> {
  table: Table<TData>;
  placeholder?: string;
  className?: string;
}

export function DataTableSearch<TData>({
  table,
  placeholder = "Search...",
  className = "h-8 w-[150px] lg:w-[250px]",
}: DataTableSearchProps<TData>) {
  return (
    <Input
      placeholder={placeholder}
      value={table.getState().globalFilter ?? ""}
      onChange={(event) => table.setGlobalFilter(event.target.value)}
      className={className}
    />
  );
}
