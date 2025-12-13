import { Filter } from "lucide-react";
import type { TransactionType } from "../schema/schema.types";

export type PaginationData<T> = {
  result: T[];
  rowCount: number;
};

export type PaginationParams = {
  pageIndex: number;
  pageSize: number;
};

export type SortParams = {
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export type Filters<T> = Partial<T & PaginationParams & SortParams>;

export type TransactionWithRelations = {
  type: TransactionType;
  quantity: number;
  reference: string;
  note: string | null;
  createdAt: Date;
  product: string;
  createdBy: string;
};
