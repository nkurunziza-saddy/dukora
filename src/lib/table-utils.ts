import type { SortingState } from "@tanstack/react-table";
import type { SortParams } from "@/types/table-types";

/**
 * Convert TanStack Table SortingState to URL-friendly format
 * Example: [{id: "name", desc: true}] → "name.desc"
 */
export const stateToSortBy = (
  sorting: SortingState | undefined,
): SortParams["sortBy"] | undefined => {
  if (!sorting || sorting.length === 0) return undefined;

  const sort = sorting[0];
  return `${sort.id}.${sort.desc ? "desc" : "asc"}` as const;
};

/**
 * Convert URL sortBy param to TanStack Table SortingState
 * Example: "name.desc" → [{id: "name", desc: true}]
 */
export const sortByToState = (
  sortBy: SortParams["sortBy"] | undefined,
): SortingState => {
  if (!sortBy) return [];

  const [id, desc] = sortBy.split(".");
  return [{ id, desc: desc === "desc" }];
};

/**
 * Remove undefined, null, and empty string values from an object
 * Used to clean filter params before updating URL
 */
export function cleanEmptyParams<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value != null && value !== "") {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
}
