"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Table as TableType,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableEmpty } from "../core/data-table-empty";
import { DataTableSearch } from "../data-table-search";
import { DataTableToolbar } from "../data-table-toolbar";
import { useTableVirtualizer } from "./use-table-virtualizer";

interface ToolbarRenderProps<TData> {
  table: TableType<TData>;
  globalFilter: string;
  onGlobalFilterChange?: (value: string) => void;
}

interface VirtualizedDataTableProps<TData, TValue> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Table data */
  data: TData[];
  /** Total row count for server-side pagination */
  rowCount?: number;
  /** Container height - required for virtualization */
  containerHeight?: number | string;
  /** Estimated row height */
  estimateRowHeight?: number;
  /** Number of rows to render outside viewport */
  overscan?: number;
  /** Pagination state */
  pagination?: PaginationState;
  /** Pagination change handler */
  onPaginationChange?: OnChangeFn<PaginationState>;
  /** Sorting state */
  sorting?: SortingState;
  /** Sorting change handler */
  onSortingChange?: OnChangeFn<SortingState>;
  /** Column filters */
  columnFilters?: ColumnFiltersState;
  /** Column filters change handler */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  /** Global filter */
  globalFilter?: string;
  /** Global filter change handler */
  onGlobalFilterChange?: OnChangeFn<string>;
  /** Column visibility */
  columnVisibility?: VisibilityState;
  /** Column visibility change handler */
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  /** Row selection */
  rowSelection?: RowSelectionState;
  /** Row selection change handler */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Custom empty message */
  emptyMessage?: string;
  /** Custom className */
  className?: string;
  /** Render expanded row content */
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  /** Show default toolbar with search and view options */
  showToolbar?: boolean;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Custom toolbar renderer */
  renderToolbar?: (props: ToolbarRenderProps<TData>) => React.ReactNode;
}

/**
 * Virtualized DataTable for large datasets.
 * Uses @tanstack/react-virtual for efficient rendering of 50k+ rows.
 */
export function VirtualizedDataTable<TData, TValue>({
  columns,
  data,
  rowCount,
  containerHeight = 600,
  estimateRowHeight = 40,
  overscan = 10,
  pagination,
  onPaginationChange,
  sorting = [],
  onSortingChange,
  columnFilters = [],
  onColumnFiltersChange,
  globalFilter = "",
  onGlobalFilterChange,
  columnVisibility = {},
  onColumnVisibilityChange,
  rowSelection = {},
  onRowSelectionChange,
  enableRowSelection = false,
  emptyMessage,
  className,
  renderExpandedRow,
  showToolbar = true,
  searchPlaceholder,
  renderToolbar,
}: VirtualizedDataTableProps<TData, TValue>) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Create stable state reference
  const tableState = React.useMemo(
    () => ({
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      ...(pagination && { pagination }),
    }),
    [
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    ],
  );

  const table = useReactTable({
    data,
    columns,
    state: tableState,
    rowCount: rowCount ?? data.length,
    manualPagination: !!pagination,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onColumnFiltersChange || !!onGlobalFilterChange,
    enableRowSelection,
    onRowSelectionChange: onRowSelectionChange ?? (() => {}),
    onSortingChange: onSortingChange ?? (() => {}),
    onColumnFiltersChange: onColumnFiltersChange ?? (() => {}),
    onGlobalFilterChange: onGlobalFilterChange ?? (() => {}),
    onColumnVisibilityChange: onColumnVisibilityChange ?? (() => {}),
    onPaginationChange: onPaginationChange ?? (() => {}),
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const { virtualRows, totalSize, getRowStyle } = useTableVirtualizer({
    table,
    containerRef,
    estimateSize: estimateRowHeight,
    overscan,
  });

  const { rows } = table.getRowModel();

  // Toolbar render props
  const toolbarProps: ToolbarRenderProps<TData> = React.useMemo(
    () => ({
      table,
      globalFilter,
      onGlobalFilterChange: onGlobalFilterChange
        ? (value: string) => onGlobalFilterChange(value)
        : undefined,
    }),
    [table, globalFilter, onGlobalFilterChange],
  );

  // Default toolbar content
  const defaultToolbarContent = React.useMemo(
    () => (
      <DataTableToolbar
        leftSlot={
          <DataTableSearch
            className="w-full sm:w-64"
            placeholder={searchPlaceholder}
            table={table}
          />
        }
        table={table}
      />
    ),
    [table, searchPlaceholder],
  );

  // Determine which toolbar to render
  const toolbarElement = React.useMemo(() => {
    if (renderToolbar) {
      return renderToolbar(toolbarProps);
    }
    if (showToolbar) {
      return defaultToolbarContent;
    }
    return null;
  }, [renderToolbar, toolbarProps, showToolbar, defaultToolbarContent]);

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      {/* Toolbar */}
      {toolbarElement}

      {/* Virtualized Table Container */}
      <div
        className="overflow-auto rounded-lg border"
        ref={containerRef}
        style={{
          height:
            typeof containerHeight === "number"
              ? `${containerHeight}px`
              : containerHeight,
        }}
      >
        <div style={{ height: `${totalSize}px`, position: "relative" }}>
          <Table className="min-w-full border-separate border-spacing-0">
            <TableHeader className="bg-muted/50 backdrop-blur-xs sticky top-0 z-10">
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
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <DataTableEmpty
                  columnsCount={columns.length}
                  message={emptyMessage}
                />
              ) : (
                virtualRows.map((virtualRow) => {
                  const row = virtualRow.row;
                  const isExpanded = row.getIsExpanded();
                  const isSelected = row.getIsSelected();

                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        className={`transition-colors ${
                          isExpanded
                            ? "bg-muted/60 border-l-4 border-muted"
                            : virtualRow.index % 2 === 0
                              ? "bg-background"
                              : "bg-muted/40"
                        } hover:bg-muted/60 border-b border-border`}
                        data-index={virtualRow.index}
                        data-state={isSelected && "selected"}
                        style={getRowStyle(virtualRow)}
                      >
                        {row.getVisibleCells().map((cell, index) => (
                          <TableCell
                            className={`whitespace-nowrap px-3 py-2 text-sm text-foreground ${
                              index >= 3 ? "hidden md:table-cell" : ""
                            }`}
                            key={cell.id}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      {isExpanded && renderExpandedRow && (
                        <TableRow className="bg-muted/80">
                          <TableCell
                            className="p-4 border-b border-border"
                            colSpan={row.getVisibleCells().length}
                          >
                            {renderExpandedRow(row)}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
