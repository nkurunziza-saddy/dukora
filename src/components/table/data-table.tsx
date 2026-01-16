"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { Table } from "@/components/ui/table";
import { DataTableBody, DataTableHeader } from "./core";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSearch } from "./data-table-search";
import { DataTableToolbar } from "./data-table-toolbar";
import type { FacetedFilterConfig, ToolbarRenderProps } from "./types";

// =============================================================================
// PROPS INTERFACE
// =============================================================================

interface DataTableProps<TData, TValue> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Table data */
  data: TData[];
  /** Total row count for pagination */
  rowCount: number;

  // Pagination
  /** Current pagination state */
  pagination: PaginationState;
  /** Pagination change handler */
  onPaginationChange: OnChangeFn<PaginationState>;

  // Sorting
  /** Current sorting state */
  sorting: SortingState;
  /** Sorting change handler */
  onSortingChange: OnChangeFn<SortingState>;

  // Filtering
  /** Global filter value */
  globalFilter?: string;
  /** Global filter change handler */
  onGlobalFilterChange?: OnChangeFn<string>;
  /** Column filters */
  columnFilters?: ColumnFiltersState;
  /** Column filters change handler */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;

  // Column visibility
  /** Column visibility state */
  columnVisibility?: VisibilityState;
  /** Column visibility change handler */
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;

  // Row selection
  /** Row selection state */
  rowSelection?: RowSelectionState;
  /** Row selection change handler */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /** Enable row selection */
  enableRowSelection?: boolean;

  // Expansion
  /** Render expanded row content */
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;

  // Toolbar customization (render props pattern)
  /** Custom toolbar renderer - replaces default toolbar */
  renderToolbar?: (props: ToolbarRenderProps<TData>) => React.ReactNode;
  /** Show default toolbar (with search and view options) when no renderToolbar is provided */
  showToolbar?: boolean;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Faceted filter configurations */
  facetedFilters?: FacetedFilterConfig[];

  // UI customization
  /** Custom empty message */
  emptyMessage?: string;
  /** Show loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Enable sticky header */
  stickyHeader?: boolean;
  /** Hide pagination */
  hidePagination?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Fully controlled DataTable component.
 *
 * Features:
 * - All state is controlled externally for predictable behavior
 * - Default toolbar with search and column visibility
 * - Render props pattern for toolbar customization
 * - Memoized sub-components for performance
 * - Server-side pagination/sorting/filtering ready
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   rowCount={totalCount}
 *   pagination={pagination}
 *   onPaginationChange={setPagination}
 *   sorting={sorting}
 *   onSortingChange={setSorting}
 *   showToolbar // shows default toolbar with search
 * />
 * ```
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  rowCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  globalFilter = "",
  onGlobalFilterChange,
  columnFilters = [],
  onColumnFiltersChange,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  enableRowSelection = false,
  renderExpandedRow,
  renderToolbar,
  showToolbar = true,
  searchPlaceholder,
  facetedFilters = [],
  emptyMessage,
  isLoading = false,
  className,
  stickyHeader = true,
  hidePagination = false,
}: DataTableProps<TData, TValue>) {
  // Local state for uncontrolled column visibility
  const [localColumnVisibility, setLocalColumnVisibility] =
    React.useState<VisibilityState>({});
  const [localRowSelection, setLocalRowSelection] =
    React.useState<RowSelectionState>({});

  // Use controlled state if provided, otherwise local
  const columnVisibility = controlledColumnVisibility ?? localColumnVisibility;
  const rowSelection = controlledRowSelection ?? localRowSelection;

  // Create stable state reference to prevent unnecessary re-renders
  const tableState = React.useMemo(
    () => ({
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    }),
    [
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    ]
  );

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    state: tableState,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
    enableRowSelection,
    onRowSelectionChange: onRowSelectionChange ?? setLocalRowSelection,
    onSortingChange,
    onColumnFiltersChange: onColumnFiltersChange ?? (() => {}),
    onGlobalFilterChange: onGlobalFilterChange ?? (() => {}),
    onColumnVisibilityChange:
      onColumnVisibilityChange ?? setLocalColumnVisibility,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Toolbar render props
  const toolbarProps: ToolbarRenderProps<TData> = React.useMemo(
    () => ({
      table,
      globalFilter,
      onGlobalFilterChange: onGlobalFilterChange
        ? (value: string) => onGlobalFilterChange(value)
        : undefined,
    }),
    [table, globalFilter, onGlobalFilterChange]
  );

  // Default toolbar content
  const defaultToolbarContent = React.useMemo(
    () => (
      <DataTableToolbar
        leftSlot={
          <>
            <DataTableSearch
              className="w-full sm:w-64"
              placeholder={searchPlaceholder}
              table={table}
            />
            {facetedFilters.map((filter) => (
              <DataTableFacetedFilter
                column={table.getColumn(filter.columnId)}
                key={filter.columnId}
                options={filter.options}
                title={filter.title}
              />
            ))}
          </>
        }
        table={table}
      />
    ),
    [table, searchPlaceholder, facetedFilters]
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
    <div className={`flex flex-col gap-4 py-4 ${className ?? ""}`}>
      {/* Toolbar */}
      {toolbarElement}

      {/* Table */}
      <div className="rounded-lg border overflow-auto">
        <Table className="min-w-full border-separate border-spacing-0">
          <DataTableHeader stickyHeader={stickyHeader} table={table} />
          <DataTableBody
            columnsCount={columns.length}
            emptyMessage={emptyMessage}
            isLoading={isLoading}
            renderExpandedRow={renderExpandedRow}
            table={table}
          />
        </Table>
      </div>

      {/* Pagination */}
      {!hidePagination && (
        <DataTablePagination pagination={pagination} table={table} />
      )}
    </div>
  );
}
