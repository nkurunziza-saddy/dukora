"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
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
  tag,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
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
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    <div className="flex flex-col gap-4 overflow-x-auto rounded-lg">
      {renderToolbar()}
      <div className="">
        <Table className="min-w-full border-separate border-spacing-0">
          <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="bg-muted/50 border-b border-border text-foreground font-semibold text-sm"
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
          <tbody aria-hidden="true" className="table-row h-2"></tbody>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, idx) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={`transition-colors ${
                      row.getIsExpanded()
                        ? "bg-muted/60 border-l-4 border-muted"
                        : idx % 2 === 0
                          ? "bg-background"
                          : "bg-muted/40"
                    } hover:bg-muted/60 border-b border-border`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0 px-3 py-2 text-sm text-foreground"
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
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
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
