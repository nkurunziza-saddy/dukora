"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/table/data-table";

type ColumnWrapperProps<T> = {
  column: (t: (key: string) => string) => ColumnDef<T>[];
  data: T[];
  tag:
    | "products"
    | "suppliers"
    | "transactions"
    | "users"
    | "invitations"
    | "payments";
};

const ColumnWrapper = <T,>({ column, data, tag }: ColumnWrapperProps<T>) => {
  const t = useTranslations(tag === "payments" ? "payments" : "common");
  return <DataTable columns={column(t)} data={data} tag={tag} />;
};

export default ColumnWrapper;
