"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from "@tanstack/react-table";
import { InfoIcon } from "lucide-react";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface RowExpansionConfig<TData> {
  canExpand?: (row: TData) => boolean;
  contentKey?: keyof TData;
  renderContent?: (row: TData) => React.ReactNode;
  enabled?: boolean;
}

interface ExtendableDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  expansion?: RowExpansionConfig<TData>;
}

export function ExtendableDataTable<TData, TValue>({
  columns,
  data,
  expansion,
}: ExtendableDataTableProps<TData, TValue>) {
  const expansionEnabled = expansion?.enabled ?? true;
  const getRowCanExpand = React.useCallback(
    (row: TData): boolean => {
      if (!expansionEnabled) return false;
      if (expansion?.canExpand) {
        return expansion.canExpand(row);
      }
      if (expansion?.contentKey) {
        const content = row[expansion.contentKey];
        return Boolean(
          content && (typeof content === "string" ? content.trim() : content)
        );
      }
      return false;
    },
    [expansionEnabled, expansion]
  );

  const table = useReactTable({
    data,
    columns,
    getRowCanExpand: (row: Row<TData>) => getRowCanExpand(row.original),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  function renderExpandedContent(row: TData): React.ReactNode {
    if (expansion?.renderContent) {
      return expansion.renderContent(row);
    }
    if (expansion?.contentKey) {
      const content = row[expansion.contentKey];
      if (content) {
        return (
          <div className="text-muted-foreground flex items-start py-2 bg-muted/80 rounded-md">
            <span
              aria-hidden="true"
              className="me-3 mt-0.5 flex w-7 shrink-0 justify-center"
            >
              <InfoIcon className="opacity-60" size={16} />
            </span>
            <div className="text-sm">
              {typeof content === "string"
                ? content
                : JSON.stringify(content, null, 2)}
            </div>
          </div>
        );
      }
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-4 overflow-x-auto rounded-lg">
      <Table className="min-w-full border border-separate border-spacing-0">
        <TableHeader className="bg-muted/50 backdrop-blur-xs">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                return (
                  <TableHead
                    className={`text-foreground font-semibold text-sm ${
                      // Hide headers after index 2 on mobile (keep first 3 columns)
                      index >= 3 ? "hidden md:table-cell" : ""
                    }`}
                    colSpan={header.colSpan}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, idx) => (
              <React.Fragment key={row.id}>
                <TableRow
                  className={`transition-colors ${
                    row.getIsExpanded()
                      ? "bg-muted/60 border-l-4 border-muted"
                      : idx % 2 === 0
                        ? "bg-background"
                        : "bg-muted/40"
                  } hover:bg-muted/60 border-b border-border`}
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      className={`whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0 px-3 py-2 text-sm text-foreground ${
                        // Hide columns after index 2 on mobile (keep first 3 columns)
                        index >= 3 ? "hidden md:table-cell" : ""
                      }`}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {expansionEnabled && row.getIsExpanded() && (
                  <TableRow className="bg-muted/80">
                    <TableCell
                      className="p-4 border-b border-border"
                      colSpan={row.getVisibleCells().length}
                    >
                      {renderExpandedContent(row.original)}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
