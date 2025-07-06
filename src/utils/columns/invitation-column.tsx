"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { ExtendedInvitationPayload } from "@/lib/schema/schema-types";
import { Badge } from "@/components/ui/badge";
import { userStatuses } from "./user-column";
import InvitationRowActions from "@/components/table/invitation-row-actions";

export function InvitationColumn(
  t: (key: string) => string
): ColumnDef<ExtendedInvitationPayload>[] {
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
              <span>{row.original.role}</span>
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
      cell: ({ row }) => <InvitationRowActions invitation={row.original} />,
    },
  ];
}
