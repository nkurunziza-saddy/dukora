"use client";

import type { Row, Table } from "@tanstack/react-table";
import * as React from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DataTableEmpty } from "./data-table-empty";
import { DataTableRow } from "./data-table-row";

interface DataTableBodyProps<TData> {
  table: Table<TData>;
  columnsCount: number;
  emptyMessage?: string;
  isLoading?: boolean;
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
}

/**
 * Table body component that handles rendering rows.
 * Supports expansion and loading states.
 */
export function DataTableBodyComponent<TData>({
  table,
  columnsCount,
  emptyMessage,
  isLoading,
  renderExpandedRow,
}: DataTableBodyProps<TData>) {
  const rows = table.getRowModel().rows;

  if (isLoading) {
    return (
      <TableBody>
        {Array.from({ length: 5 }).map((_, idx) => (
          <TableRow key={`skeleton-${idx}`}>
            {Array.from({ length: Math.min(columnsCount, 4) }).map(
              (_, cellIdx) => (
                <TableCell
                  className={cellIdx >= 3 ? "hidden md:table-cell" : ""}
                  key={`skeleton-cell-${idx}-${cellIdx}`}
                >
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </TableCell>
              )
            )}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  if (!rows.length) {
    return (
      <TableBody>
        <DataTableEmpty columnsCount={columnsCount} message={emptyMessage} />
      </TableBody>
    );
  }

  return (
    <TableBody>
      {rows.map((row, idx) => (
        <DataTableRow
          key={row.id}
          renderExpandedContent={renderExpandedRow}
          row={row}
          rowIndex={idx}
        />
      ))}
    </TableBody>
  );
}

export const DataTableBody = React.memo(
  DataTableBodyComponent
) as typeof DataTableBodyComponent;
