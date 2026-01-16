"use client";

import type { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "./data-table-view-options";

// =============================================================================
// TYPES
// =============================================================================

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  /** Content for the left side of the toolbar */
  leftSlot?: React.ReactNode;
  /** Content for the right side of the toolbar */
  rightSlot?: React.ReactNode;
  /** Show reset filters button */
  showResetFilters?: boolean;
  /** Show column visibility toggle */
  showViewOptions?: boolean;
  /** Custom className */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Composable toolbar for DataTable.
 *
 * Uses slots pattern for flexible customization.
 *
 * @example
 * ```tsx
 * <DataTableToolbar
 *   table={table}
 *   leftSlot={<SearchInput />}
 *   rightSlot={<ExportButton />}
 * />
 * ```
 */
export function DataTableToolbar<TData>({
  table,
  leftSlot,
  rightSlot,
  showResetFilters = true,
  showViewOptions = true,
  className,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations("table");
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div
      className={`flex items-center justify-between gap-2 ${className ?? ""}`}
    >
      <div className="flex flex-1 items-center gap-2">
        {leftSlot}
        {showResetFilters && isFiltered && (
          <Button
            className="flex items-center gap-1"
            onClick={() => table.resetColumnFilters()}
            size="sm"
            variant="ghost"
          >
            <span className="hidden sm:inline">{t("reset")}</span>
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {rightSlot}
        {showViewOptions && <DataTableViewOptions table={table} />}
      </div>
    </div>
  );
}

// =============================================================================
// LEGACY EXPORT (for backward compatibility)
// =============================================================================

/**
 * @deprecated Use DataTableToolbar with slots instead
 */
export function DefaultDataTableToolbar<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  return <DataTableToolbar table={table} />;
}
