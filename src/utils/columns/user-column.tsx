"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { SelectUser } from "@/lib/schema/schema-types";
import { Circle, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UserRowActions from "@/components/table/user-row-actions";

export function UserColumn(
  t: (key: string) => string
): ColumnDef<SelectUser>[] {
  return [
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("role")} />
      ),
      cell: ({ row }) => {
        const role = userStatuses.find(
          (s) => s.value === row.original.role.toLowerCase()
        );
        if (!role) {
          return (
            <Badge variant="outline" className="capitalize">
              <span className="capitalize">
                {row.original.role.split("_").join(" ").toLowerCase()}
              </span>
            </Badge>
          );
        }
        return (
          <Badge
            variant={role.variant}
            className="capitalize flex gap-1 items-center"
          >
            {role.icon && (
              <role.icon className="text-muted-foreground size-4" />
            )}
            <span>{role.label}</span>
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("name")} />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("email")} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("createdAt")} />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt
          ? new Date(row.original.createdAt)
          : null;
        return date ? format(date, "MMM dd, yyyy") : null;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <UserRowActions user={row.original} />,
    },
  ];
}

export const userStatuses = [
  {
    value: "OWNER",
    label: "Owner",
    variant: "outline" as "secondary" | "destructive" | "outline",
    icon: Circle,
  },
  {
    value: "ADMIN",
    label: "Admin",
    variant: "secondary" as "secondary" | "destructive" | "outline",
    icon: Timer,
  },
  {
    value: "MEMBER",
    label: "Member",
    variant: "secondary" as "secondary" | "destructive" | "outline",
    icon: Timer,
  },
  {
    value: "VIEW_ONLY",
    label: "View only",
    variant: "destructive" as "secondary" | "destructive" | "outline",
    icon: Circle,
  },
];
