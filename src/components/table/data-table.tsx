"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import * as React from "react";
import { CommerceDataTableToolbar } from "@/components/table/commerce/commerce-data-table-toolbar";
import { DefaultDataTableToolbar } from "@/components/table/data-table-toolbar";
import { TransactionsDataTableToolbar } from "@/components/table/transactions/transactions-data-table-toolbar";
import { UsersDataTableToolbar } from "@/components/table/users/users-data-table-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { tagEnum } from "../providers/column-wrapper";
import { DataTablePagination } from "./data-table-pagination";
import { InvitationDataTableToolbar } from "./invitations/invitation-data-table-toolbar";
import { OrdersDataTableToolbar } from "./orders/orders-data-table-toolbar";
import { ProductsDataTableToolbar } from "./products/products-data-table-toolbar";
import { SuppliersDataTableToolbar } from "./suppliers/suppliers-data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  tag?: tagEnum;
}

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
  tag,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  // Use controlled column visibility if provided, otherwise local state
  const [localColumnVisibility, setLocalColumnVisibility] =
    React.useState<VisibilityState>({});
  const columnVisibility = controlledColumnVisibility ?? localColumnVisibility;

  const t = useTranslations("table");

  // Create a stable reference for state to ensure table updates when props change
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
    ],
  );

  const table = useReactTable({
    data,
    columns,
    state: tableState,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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

  function renderToolbar() {
    switch (tag) {
      case "products":
        return <ProductsDataTableToolbar table={table} />;
      case "suppliers":
        return <SuppliersDataTableToolbar table={table} />;
      case "transactions":
        return <TransactionsDataTableToolbar table={table} />;
      case "users":
        return <UsersDataTableToolbar table={table} />;
      case "invitations":
        return <InvitationDataTableToolbar table={table} />;
      case "orders":
        return <OrdersDataTableToolbar table={table} />;
      case "commerce":
        return <CommerceDataTableToolbar table={table} />;
      default:
        return <DefaultDataTableToolbar table={table} />;
    }
  }

  return (
    <div className="sticky z-10 flex flex-col gap-4 py-4">
      {renderToolbar()}
      <div className="rounded-lg border overflow-auto">
        <Table className="min-w-full border-separate border-spacing-0">
          <TableHeader className="bg-muted/50 backdrop-blur-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      className={`text-foreground font-semibold text-sm ${
                        index >= 3 ? "hidden md:table-cell" : ""
                      }`}
                      colSpan={header.colSpan}
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        className={`whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0 px-3 py-2 text-sm text-foreground ${
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
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={columns.length}
                >
                  {t("noResultsFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} pagination={pagination} />
    </div>
  );
}
