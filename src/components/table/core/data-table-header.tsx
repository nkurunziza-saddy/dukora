"use client";

import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import * as React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
  stickyHeader?: boolean;
}

/**
 * Memoized table header component for performance.
 * Renders column headers with proper styling and sticky support.
 */
function DataTableHeaderComponent<TData>({
  table,
  stickyHeader = true,
}: DataTableHeaderProps<TData>) {
  return (
    <TableHeader
      className={`bg-muted/50 backdrop-blur-xs ${
        stickyHeader ? "sticky top-0 z-10" : ""
      }`}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow className="hover:bg-transparent" key={headerGroup.id}>
          {headerGroup.headers.map((header, index) => (
            <TableHead
              className={`text-foreground font-semibold text-sm ${
                index >= 3 ? "hidden md:table-cell" : ""
              }`}
              colSpan={header.colSpan}
              key={header.id}
              style={{
                width: header.getSize() !== 150 ? header.getSize() : undefined,
              }}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}

/**
 * Memoized DataTableHeader for performance optimization.
 * Only re-renders when table header structure actually changes.
 */
export const DataTableHeader = React.memo(
  DataTableHeaderComponent
) as typeof DataTableHeaderComponent;
