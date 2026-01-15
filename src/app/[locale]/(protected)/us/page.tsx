"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import Table, { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "./table";
import { useFilters } from "./use-filters";
import { fetchUsers } from "./user-action";
import { sortByToState, stateToSortBy } from "./utils/table-sort-mapper";
import { USER_COLUMNS } from "./utils/user-column";

export default function UsersPage() {
  const { filters, resetFilters, setFilters } = useFilters();
  const { data } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => fetchUsers(filters),
    placeholderData: keepPreviousData,
  });

  const paginationState = {
    pageIndex: filters.pageIndex ?? DEFAULT_PAGE_INDEX,
    pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
  };
  const sortingState = sortByToState(filters.sortBy);
  const columns = useMemo(() => USER_COLUMNS, []);

  return (
    <div className="flex flex-col gap-2 p-2">
      <h1 className="text-2xl font-semibold mb-1">
        TanStack Table + Query + Router
      </h1>
      <Table
        data={data?.result ?? []}
        columns={columns}
        pagination={paginationState}
        paginationOptions={{
          onPaginationChange: (pagination) => {
            setFilters(
              typeof pagination === "function"
                ? pagination(paginationState)
                : pagination,
            );
          },
          rowCount: data?.rowCount,
        }}
        filters={filters}
        onFilterChange={(filters) => setFilters(filters)}
        sorting={sortingState}
        onSortingChange={(updaterOrValue) => {
          const newSortingState =
            typeof updaterOrValue === "function"
              ? updaterOrValue(sortingState)
              : updaterOrValue;
          return setFilters({ sortBy: stateToSortBy(newSortingState) });
        }}
      />
      <div className="flex items-center gap-2">
        {data?.rowCount} users found
        <button
          className="border rounded p-1 disabled:text-gray-500 disabled:cursor-not-allowed"
          onClick={resetFilters}
          disabled={Object.keys(filters).length === 0}
        >
          Reset Filters
        </button>
      </div>
      <pre>{JSON.stringify(filters, null, 2)}</pre>
    </div>
  );
}
