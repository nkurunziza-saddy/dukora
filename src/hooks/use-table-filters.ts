"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { cleanEmptyParams } from "@/lib/table-utils";
import type { PaginationParams, SortParams } from "@/types/table-types";

export function useTableFilters<T extends Record<string, unknown>>() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const rawFilters = Object.fromEntries(searchParams.entries());

    const parsed: Partial<T & PaginationParams & SortParams> = {
      ...rawFilters,
      pageIndex: rawFilters.pageIndex
        ? parseInt(rawFilters.pageIndex, 10)
        : undefined,
      pageSize: rawFilters.pageSize
        ? parseInt(rawFilters.pageSize, 10)
        : undefined,
      sortBy: rawFilters.sortBy as SortParams["sortBy"] | undefined,
    } as Partial<T & PaginationParams & SortParams>;

    return parsed;
  }, [searchParams]);

  const setFilters = useCallback(
    (partialFilters: Partial<T & PaginationParams & SortParams>) => {
      const mergedFilters = { ...filters, ...partialFilters };
      const newFilters = cleanEmptyParams(mergedFilters);

      const newSearchParams = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          newSearchParams.append(key, String(value));
        }
      });

      const queryString = newSearchParams.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

      router.push(newUrl);
    },
    [filters, router],
  );

  const resetFilters = useCallback(() => {
    router.push(window.location.pathname);
  }, [router]);

  return { filters, setFilters, resetFilters };
}
