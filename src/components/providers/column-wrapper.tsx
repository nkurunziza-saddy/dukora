"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/table/data-table";

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
};

const ColumnWrapper = <T,>({
  column,
  data,
  totalCount,
  page,
  pageSize,
  tag,
}: ColumnWrapperProps<T>) => {
  const t = useTranslations(tag === "payments" ? "payments" : "common");
  return (
    <DataTable
      columns={column(t)}
      data={data}
      page={page}
      pageSize={pageSize}
      tag={tag}
      totalCount={totalCount}
    />
  );
};

export default ColumnWrapper;
