import { useRouter, useSearchParams } from "next/navigation";
import type { PaginationParams, SortParams } from "./types";
import { cleanEmptyParams } from "./utils/clean-empy-params";

export function useFilters<T extends Record<string, any>>() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFilters = Object.fromEntries(searchParams.entries());

  const filters: Partial<T & PaginationParams & SortParams> = {
    ...rawFilters,
    pageIndex: rawFilters.pageIndex
      ? parseInt(rawFilters.pageIndex, 10)
      : undefined,
    pageSize: rawFilters.pageSize
      ? parseInt(rawFilters.pageSize, 10)
      : undefined,
    sortBy: rawFilters.sortBy as SortParams["sortBy"] | undefined,
  };

  const setFilters = (
    partialFilters: Partial<T & PaginationParams & SortParams>,
  ) => {
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
  };

  const resetFilters = () => router.push(window.location.pathname);

  return { filters, setFilters, resetFilters };
}
