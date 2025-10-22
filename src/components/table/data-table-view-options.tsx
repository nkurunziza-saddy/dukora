"use client";

import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
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
            variant="outline"
            size="sm"
            className="ml-auto hidden lg:flex"
          />
        }
      >
        <Settings2 className="size-3.5" />
        {t("view")}
      </MenuTrigger>
      <MenuPopup align="end" className="w-[150px]">
        <MenuGroup>
          <MenuGroupLabel>{t("toggleColumns")}</MenuGroupLabel>

          <MenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide(),
            )
            .map((column) => {
              return (
                <MenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
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
