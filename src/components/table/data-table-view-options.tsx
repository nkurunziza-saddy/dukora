"use client";

import type { Table } from "@tanstack/react-table";
import { Settings2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { formatKeys } from "@/lib/utils";

export function DataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  const t = useTranslations("table");
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            className="ml-auto flex items-center gap-1"
            size="sm"
            variant="outline"
          />
        }
      >
        <Settings2Icon className="size-4" />
        <span className="hidden sm:inline">{t("view")}</span>
      </MenuTrigger>
      <MenuPopup align="end" className="w-[150px]">
        <MenuGroup>
          <MenuGroupLabel>{t("toggleColumns")}</MenuGroupLabel>

          <MenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => {
              return (
                <MenuCheckboxItem
                  checked={column.getIsVisible()}
                  className="capitalize"
                  key={column.id}
                  onCheckedChange={(value) => column.toggleVisibility(value)}
                >
                  {column.id !== "isbn"
                    ? formatKeys(column.id)
                    : column.id.toUpperCase()}
                </MenuCheckboxItem>
              );
            })}
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}
