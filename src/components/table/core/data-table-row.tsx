"use client";

import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import * as React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

interface DataTableRowProps<TData> {
  row: Row<TData>;
  rowIndex: number;
  renderExpandedContent?: (row: Row<TData>) => React.ReactNode;
}

/**
 * Memoized table row component.
 * Optimized to prevent unnecessary re-renders when other rows change.
 */
function DataTableRowComponent<TData>({
  row,
  rowIndex,
  renderExpandedContent,
}: DataTableRowProps<TData>) {
  const isExpanded = row.getIsExpanded();
  const isSelected = row.getIsSelected();

  return (
    <React.Fragment>
      <TableRow
        className={`transition-colors ${
          isExpanded
            ? "bg-muted/60 border-l-4 border-muted"
            : rowIndex % 2 === 0
              ? "bg-background"
              : "bg-muted/40"
        } hover:bg-muted/60 border-b border-border`}
        data-state={isSelected && "selected"}
      >
        {row.getVisibleCells().map((cell, index) => (
          <TableCell
            className={`whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0 px-3 py-2 text-sm text-foreground ${
              index >= 3 ? "hidden md:table-cell" : ""
            }`}
            key={cell.id}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
      {isExpanded && renderExpandedContent && (
        <TableRow className="bg-muted/80">
          <TableCell
            className="p-4 border-b border-border"
            colSpan={row.getVisibleCells().length}
          >
            {renderExpandedContent(row)}
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

/**
 * Custom comparison function for React.memo.
 * Only re-renders when relevant row state changes.
 */
function areRowPropsEqual<TData>(
  prevProps: DataTableRowProps<TData>,
  nextProps: DataTableRowProps<TData>
): boolean {
  // Always re-render if row ID changes
  if (prevProps.row.id !== nextProps.row.id) return false;

  // Check if selection state changed
  if (prevProps.row.getIsSelected() !== nextProps.row.getIsSelected())
    return false;

  // Check if expansion state changed
  if (prevProps.row.getIsExpanded() !== nextProps.row.getIsExpanded())
    return false;

  // Check if row index changed (for alternating styles)
  if (prevProps.rowIndex !== nextProps.rowIndex) return false;

  return true;
}

/**
 * Memoized DataTableRow for performance optimization.
 */
export const DataTableRow = React.memo(
  DataTableRowComponent,
  areRowPropsEqual
) as typeof DataTableRowComponent;
