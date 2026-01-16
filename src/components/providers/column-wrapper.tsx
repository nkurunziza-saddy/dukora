"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import type { FacetedFilterConfig } from "@/components/table/types";
import { sortByToState, stateToSortBy } from "@/lib/table-utils";
import { productStatuses as commerceStatuses } from "@/utils/columns/commerce-column";
import { productStatuses } from "@/utils/columns/product-column";

export type tagEnum =
  | "products"
  | "suppliers"
  | "transactions"
  | "users"
  | "invitations"
  | "orders"
  | "commerce"
  | "payments";

type ColumnWrapperProps<T> = {
  column: (t: (key: string) => string) => ColumnDef<T>[];
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  tag: tagEnum;
  sorting?: { id: string; desc: boolean }[] | SortingState;
  search?: string;
};

const ColumnWrapper = <T,>({
  column,
  data,
  totalCount,
  page,
  pageSize,
  tag,
  sorting: propsSorting = [],
  search: propsSearch = "",
}: ColumnWrapperProps<T>) => {
  const t = useTranslations(tag === "payments" ? "payments" : "common");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read state directly from URL params on every render (source of truth for UI)
  // Don't use useMemo - compute directly so it always reflects current URL state
  // This pattern matches the /us example which works correctly
  const urlPage = searchParams.get("page");
  const urlPageSize = searchParams.get("pageSize");
  const urlSort = searchParams.get("sort");
  const urlSearch = searchParams.get("search");
  const urlColumnVisibility = searchParams.get("columns");
  const urlColumnFilters = searchParams.get("filters");

  // Create new object references to ensure React detects changes
  const pagination: PaginationState = {
    pageIndex: urlPage ? parseInt(urlPage, 10) - 1 : page - 1,
    pageSize: urlPageSize ? parseInt(urlPageSize, 10) : pageSize,
  };

  const sorting: SortingState = (() => {
    if (urlSort) {
      const result = sortByToState(urlSort as `${string}.${"asc" | "desc"}`);
      // Always return a new array reference
      return result ? [...result] : [];
    }
    // Convert props sorting format to SortingState if needed
    if (
      propsSorting &&
      Array.isArray(propsSorting) &&
      propsSorting.length > 0
    ) {
      // Check if it's already in SortingState format (has id and desc properties)
      const firstSort = propsSorting[0];
      if (
        firstSort &&
        typeof firstSort === "object" &&
        "id" in firstSort &&
        "desc" in firstSort
      ) {
        // Return a new array reference
        return [...propsSorting] as SortingState;
      }
    }
    return [];
  })();

  const globalFilter: string = urlSearch ?? propsSearch;

  // Parse column visibility from URL - always return new object reference
  const columnVisibility: VisibilityState = (() => {
    if (urlColumnVisibility) {
      try {
        // URLSearchParams already decodes, so just parse directly
        const parsed = JSON.parse(urlColumnVisibility);
        return { ...parsed }; // New object reference
      } catch {
        return {};
      }
    }
    return {};
  })();

  // Parse column filters from URL - always return new array reference
  const columnFilters: ColumnFiltersState = (() => {
    if (urlColumnFilters) {
      try {
        // URLSearchParams already decodes, so just parse directly
        const parsed = JSON.parse(urlColumnFilters);
        return Array.isArray(parsed) ? [...parsed] : []; // New array reference
      } catch {
        return [];
      }
    }
    return [];
  })();

  // Handle pagination changes - update URL
  const onPaginationChange = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const currentPagination = (() => {
        const urlPage = searchParams.get("page");
        const urlPageSize = searchParams.get("pageSize");
        return {
          pageIndex: urlPage ? parseInt(urlPage, 10) - 1 : page - 1,
          pageSize: urlPageSize ? parseInt(urlPageSize, 10) : pageSize,
        };
      })();

      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(currentPagination)
          : updaterOrValue;

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", (newPagination.pageIndex + 1).toString());
      params.set("pageSize", newPagination.pageSize.toString());

      // Use window.location.pathname like /us example - more reliable for URL updates
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      router.push(`${currentPath}?${params.toString()}`);
    },
    [router, searchParams, page, pageSize]
  );

  // Handle sorting changes - update URL
  const onSortingChange = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const currentSorting = (() => {
        const urlSort = searchParams.get("sort");
        if (urlSort) {
          return sortByToState(urlSort as `${string}.${"asc" | "desc"}`);
        }
        if (
          propsSorting &&
          Array.isArray(propsSorting) &&
          propsSorting.length > 0
        ) {
          const firstSort = propsSorting[0];
          if (
            firstSort &&
            typeof firstSort === "object" &&
            "id" in firstSort &&
            "desc" in firstSort
          ) {
            return propsSorting as SortingState;
          }
        }
        return [];
      })();

      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(currentSorting)
          : updaterOrValue;

      const params = new URLSearchParams(searchParams.toString());
      const sortBy = stateToSortBy(newSorting);

      if (sortBy) {
        params.set("sort", sortBy);
      } else {
        params.delete("sort");
      }
      // Reset to page 1 when sorting changes
      params.set("page", "1");

      // Use window.location.pathname like /us example - more reliable for URL updates
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      router.push(`${currentPath}?${params.toString()}`);
    },
    [router, searchParams, propsSorting]
  );

  // Handle global filter (search) changes - update URL
  const onGlobalFilterChange = useCallback(
    (updaterOrValue: Updater<string>) => {
      const currentFilter = searchParams.get("search") ?? propsSearch;
      const newValue =
        typeof updaterOrValue === "function"
          ? updaterOrValue(currentFilter)
          : updaterOrValue;

      const params = new URLSearchParams(searchParams.toString());
      if (newValue) {
        params.set("search", newValue);
      } else {
        params.delete("search");
      }
      // Reset to page 1 when search changes
      params.set("page", "1");

      // Use window.location.pathname like /us example - more reliable for URL updates
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      router.push(`${currentPath}?${params.toString()}`);
    },
    [router, searchParams, propsSearch]
  );

  // Handle column filters changes - update URL
  const onColumnFiltersChange = useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      const currentFilters = (() => {
        const urlFilters = searchParams.get("filters");
        if (urlFilters) {
          try {
            // URLSearchParams already decodes, so just parse directly
            return JSON.parse(urlFilters);
          } catch {
            return [];
          }
        }
        return [];
      })();

      const newFilters =
        typeof updaterOrValue === "function"
          ? updaterOrValue(currentFilters)
          : updaterOrValue;

      const params = new URLSearchParams(searchParams.toString());
      if (newFilters && newFilters.length > 0) {
        // Don't use encodeURIComponent - URLSearchParams handles encoding
        params.set("filters", JSON.stringify(newFilters));
      } else {
        params.delete("filters");
      }
      // Reset to page 1 when filters change
      params.set("page", "1");

      // Use window.location.pathname like /us example - more reliable for URL updates
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      router.push(`${currentPath}?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handle column visibility changes - update URL
  const onColumnVisibilityChange = useCallback(
    (updaterOrValue: Updater<VisibilityState>) => {
      const currentVisibility = (() => {
        const urlColumns = searchParams.get("columns");
        if (urlColumns) {
          try {
            // URLSearchParams already decodes, so just parse directly
            return JSON.parse(urlColumns);
          } catch {
            return {};
          }
        }
        return {};
      })();

      const newVisibility =
        typeof updaterOrValue === "function"
          ? updaterOrValue(currentVisibility)
          : updaterOrValue;

      const params = new URLSearchParams(searchParams.toString());
      if (newVisibility && Object.keys(newVisibility).length > 0) {
        // Don't use encodeURIComponent - URLSearchParams handles encoding
        params.set("columns", JSON.stringify(newVisibility));
      } else {
        params.delete("columns");
      }

      // Use window.location.pathname like /us example - more reliable for URL updates
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      router.push(`${currentPath}?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Get faceted filters based on tag
  const facetedFilters = useMemo((): FacetedFilterConfig[] => {
    switch (tag) {
      case "products":
        return [
          {
            columnId: "status",
            title: "Status",
            options: productStatuses.map((s) => ({
              label: s.label,
              value: s.value,
              icon: s.icon,
            })),
          },
        ];
      case "commerce":
        return [
          {
            columnId: "status",
            title: "Status",
            options: commerceStatuses.map((s) => ({
              label: s.label,
              value: s.value,
              icon: s.icon,
            })),
          },
        ];
      default:
        return [];
    }
  }, [tag]);

  return (
    <DataTable
      columns={column(t)}
      data={data}
      rowCount={totalCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      facetedFilters={facetedFilters}
    />
  );
};

export default ColumnWrapper;
