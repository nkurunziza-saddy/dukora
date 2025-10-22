import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const t = useTranslations("table");
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Menu>
        <MenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="data-[state=open]:bg-accent items-center flex -ml-3 h-8"
            />
          }
        >
          <span>{title}</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="size-3.5" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ChevronsUpDown className="size-3.5" />
          )}
        </MenuTrigger>
        <MenuPopup align="start">
          <MenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp />
            {t("sortAsc")}
          </MenuItem>
          <MenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown />
            {t("sortDesc")}
          </MenuItem>
          <MenuSeparator />
          <MenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff />
            {t("hide")}
          </MenuItem>
        </MenuPopup>
      </Menu>
    </div>
  );
}
