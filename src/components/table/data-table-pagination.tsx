import type { Table } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
    <div className="flex items-center justify-between gap-x-4">
      <div className="flex items-center space-x-2">
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            handlePageSizeChange(Number(value));
          }}
        >
          <SelectTrigger size="sm">
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
      </div>

      <div className="flex w-[100px] items-center text-foreground/85 justify-center text-sm">
        {table.getState().pagination.pageIndex + 1} {t("of")}{" "}
        {table.getPageCount()}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden lg:flex"
          onClick={() => handlePageChange(1)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">{t("goToFirstPage")}</span>
          <ChevronsLeftIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() =>
            handlePageChange(table.getState().pagination.pageIndex)
          }
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">{t("goToPreviousPage")}</span>
          <ChevronLeftIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() =>
            handlePageChange(table.getState().pagination.pageIndex + 2)
          }
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">{t("goToNextPage")}</span>
          <ChevronRightIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden lg:flex"
          onClick={() => handlePageChange(table.getPageCount())}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">{t("goToLastPage")}</span>
          <ChevronsRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
