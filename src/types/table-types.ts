export type PaginatedData<T> = {
  result: T[];
  rowCount: number;
};

export type PaginationParams = {
  pageIndex: number;
  pageSize: number;
};

export type SortParams = {
  sortBy: `${string}.${"asc" | "desc"}`;
};

export type Filters<T> = Partial<T & PaginationParams & SortParams>;

export const DEFAULT_PAGE_INDEX = 0;
export const DEFAULT_PAGE_SIZE = 10;
