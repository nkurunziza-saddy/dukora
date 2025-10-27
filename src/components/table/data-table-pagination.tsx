import type { Table } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const t = useTranslations("table");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (pageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", pageSize.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center space-x-2">
        <Select
          onValueChange={(value) => {
            handlePageSizeChange(Number(value));
          }}
          value={`${table.getState().pagination.pageSize}`}
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
          {table.getState().pagination.pageIndex + 1} {t("of")}{" "}
          {table.getPageCount()}
        </span>
        <span className="sm:hidden">
          {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
        </span>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        <Button
          className="hidden lg:flex"
          disabled={!table.getCanPreviousPage()}
          onClick={() => handlePageChange(1)}
          size="icon-sm"
          variant="outline"
        >
          <span className="sr-only">{t("goToFirstPage")}</span>
          <ChevronsLeftIcon className="size-4" />
        </Button>
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() =>
            handlePageChange(table.getState().pagination.pageIndex)
          }
          size="icon-sm"
          variant="outline"
        >
          <span className="sr-only">{t("goToPreviousPage")}</span>
          <ChevronLeftIcon className="size-4" />
        </Button>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() =>
            handlePageChange(table.getState().pagination.pageIndex + 2)
          }
          size="icon-sm"
          variant="outline"
        >
          <span className="sr-only">{t("goToNextPage")}</span>
          <ChevronRightIcon className="size-4" />
        </Button>
        <Button
          className="hidden lg:flex"
          disabled={!table.getCanNextPage()}
          onClick={() => handlePageChange(table.getPageCount())}
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
