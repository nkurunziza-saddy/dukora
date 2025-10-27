"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import * as React from "react";
import { DefaultDataTableToolbar } from "@/components/table/data-table-toolbar";
import { TransactionsDataTableToolbar } from "@/components/table/transactions-data-table-toolbar";
import { UsersDataTableToolbar } from "@/components/table/users-data-table-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { InvitationDataTableToolbar } from "./invitation-data-table-toolbar";
import { ProductsDataTableToolbar } from "./products-data-table-toolbar";
import { SuppliersDataTableToolbar } from "./suppliers-data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount: number;
  page: number;
  pageSize: number;
  tag?:
    | "products"
    | "suppliers"
    | "transactions"
    | "users"
    | "invitations"
    | "payments";
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  page,
  pageSize,
  tag,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const t = useTranslations("table");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      <DataTablePagination table={table} />
    </div>
  );
}
