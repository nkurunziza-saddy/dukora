import type { Table } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pagination?: { pageIndex: number; pageSize: number };
}

export function DataTablePagination<TData>({
  table,
  pagination: controlledPagination,
}: DataTablePaginationProps<TData>) {
  const t = useTranslations("table");

  const pagination = controlledPagination ?? table.getState().pagination;

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center space-x-2">
        <Select
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
          value={`${pagination.pageSize}`}
        >
          <SelectTrigger className="w-16 sm:w-20" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup side="top">
            {[10, 20, 25, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
        <span className="hidden sm:inline text-sm text-muted-foreground">
          {t("perPage")}
        </span>
      </div>

      <div className="flex items-center text-foreground/85 justify-center text-xs sm:text-sm">
        <span className="hidden sm:inline">
          {pagination.pageIndex + 1} {t("of")} {table.getPageCount()}
        </span>
        <span className="sm:hidden">
          {pagination.pageIndex + 1}/{table.getPageCount()}
        </span>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        <Button
          className="hidden lg:flex"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
          size="icon-sm"
          variant="outline"
        >
          <span className="sr-only">{t("goToFirstPage")}</span>
          <ChevronsLeftIcon className="size-4" />
        </Button>
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          size="icon-sm"
          variant="outline"
        >
          <span className="sr-only">{t("goToPreviousPage")}</span>
          <ChevronLeftIcon className="size-4" />
        </Button>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          size="icon-sm"
          variant="outline"
        >
          <span className="sr-only">{t("goToNextPage")}</span>
          <ChevronRightIcon className="size-4" />
        </Button>
        <Button
          className="hidden lg:flex"
          disabled={!table.getCanNextPage()}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          size="icon-sm"
          variant="outline"
        >
          <span className="sr-only">{t("goToLastPage")}</span>
          <ChevronsRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
