"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DefaultDataTableToolbar } from "@/components/table/data-table-toolbar";
import { ProductsDataTableToolbar } from "./products-data-table-toolbar";
import { SuppliersDataTableToolbar } from "./suppliers-data-table-toolbar";
import { TransactionsDataTableToolbar } from "@/components/table/transactions-data-table-toolbar";
import { Info } from "lucide-react";
import { UsersDataTableToolbar } from "@/components/table/users-data-table-toolbar";
import { InvitationDataTableToolbar } from "./invitation-data-table-toolbar";
import { useTranslations } from "next-intl";

export interface RowExpansionConfig<TData> {
  canExpand?: (row: TData) => boolean;
  contentKey?: keyof TData;
  renderContent?: (row: TData) => React.ReactNode;
  enabled?: boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tag?: "products" | "suppliers" | "transactions" | "users" | "invitations";
  expansion?: RowExpansionConfig<TData>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tag,
  expansion,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const expansionEnabled = expansion?.enabled ?? false;
  const t = useTranslations("table");
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
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row: Row<TData>) => getRowCanExpand(row.original),
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

  function renderExpandedContent(row: TData): React.ReactNode {
    if (expansion?.renderContent) {
      return expansion.renderContent(row);
    }

    if (expansion?.contentKey) {
      const content = row[expansion.contentKey];
      if (content) {
        return (
          <div className="text-primary/80 flex items-start py-2">
            <span
              className="me-3 mt-0.5 flex w-7 shrink-0 justify-center"
              aria-hidden="true"
            >
              <Info className="opacity-60" size={16} />
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
    <div className="flex flex-col gap-4">
      {renderToolbar()}
      <div className="">
        <Table className="[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
          <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className=""
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
          <tbody aria-hidden="true" className="table-row h-2"></tbody>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="odd:bg-muted/20 odd:hover:bg-muted/10 border-none hover:bg-transparent"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          expansionEnabled && cell.column.id === "expander"
                            ? "whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0"
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expansionEnabled && row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length}>
                        {renderExpandedContent(row.original)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
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
