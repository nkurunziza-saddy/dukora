"use client";

import { useTranslations } from "next-intl";
import { TableCell, TableRow } from "@/components/ui/table";

interface DataTableEmptyProps {
  columnsCount: number;
  message?: string;
}

/**
 * Empty state component for tables.
 * Displays a centered message when no data is available.
 */
export function DataTableEmpty({ columnsCount, message }: DataTableEmptyProps) {
  const t = useTranslations("table");
  const displayMessage = message || t("noResultsFound");

  return (
    <TableRow>
      <TableCell
        className="h-24 text-center text-muted-foreground"
        colSpan={columnsCount}
      >
        {displayMessage}
      </TableCell>
    </TableRow>
  );
}
