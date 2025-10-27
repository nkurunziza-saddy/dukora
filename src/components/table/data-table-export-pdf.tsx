"use client";

import type { Table } from "@tanstack/react-table";
import { DownloadIcon, FileTextIcon, UsersIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { formatKeys } from "@/lib/utils";

interface DataExportPDFProps<TData> {
  table: Table<TData>;
  filename?: string;
  title?: string;
}

export function DataTableExportPDF<TData>({
  table,
  filename = "report_export",
  title = "Report",
}: DataExportPDFProps<TData>) {
  const t = useTranslations("table");
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (limit?: number) => {
    setIsExporting(true);

    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();

      const rows = limit
        ? table
            .getFilteredRowModel()
            .rows.slice(0, limit)
            .map((r) => r.original)
        : table.getFilteredRowModel().rows.map((r) => r.original);

      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(title, 20, 20);

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total Records: ${rows.length}`, 20, 30);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 37);

      const visibleColumns = table
        .getFlatHeaders()
        .filter(
          (header) =>
            header.id !== "select" &&
            header.id !== "actions" &&
            header.column.getIsVisible()
        );

      const headers = visibleColumns.map((header) => formatKeys(header.id));

      const data = rows.map((row) =>
        visibleColumns.map((header) => {
          const value = (row as Record<string, unknown>)[header.id];

          if (header.id === "status") {
            if (typeof value === "string" && value.length > 0) {
              return value.charAt(0).toUpperCase() + value.slice(1);
            }
            return "N/A";
          }

          if (header.id === "createdAt") {
            if (
              typeof value === "string" ||
              typeof value === "number" ||
              value instanceof Date
            ) {
              const date = new Date(value as string | number | Date);
              if (!isNaN(date.getTime())) {
                return date.toLocaleDateString();
              }
            }
            return "N/A";
          }

          return value !== null && value !== undefined ? String(value) : "N/A";
        })
      );

      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 50,
        theme: "striped",
        headStyles: {
          fillColor: [71, 85, 105],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [51, 65, 85],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { top: 50, left: 20, right: 20 },
        styles: {
          overflow: "linebreak",
          cellPadding: 3,
          lineColor: [203, 213, 225],
          lineWidth: 0.5,
        },
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 30,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      doc.save(`${filename}_${timestamp}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error("Error details:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            className="flex items-center gap-1"
            disabled={isExporting || totalRows === 0}
            size="sm"
            variant="outline"
          />
        }
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full size-4 border-b-2 border-current"></div>
            <span className="hidden sm:inline">{t("exporting")}</span>
          </>
        ) : (
          <>
            <DownloadIcon className="size-4" />
            <span className="hidden sm:inline">{t("export")}</span>
          </>
        )}
      </MenuTrigger>
      <MenuPopup align="end" className="w-56">
        <MenuGroup>
          <MenuGroupLabel className="flex items-center gap-2">
            <FileTextIcon className="size-3.5" />
            {t("exportOptions")}
          </MenuGroupLabel>

          <MenuSeparator />
          <div className="px-2 py-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UsersIcon className="h-3 w-3" />
              <span>{t("availableRecords", { count: totalRows })}</span>
            </div>
          </div>
          <MenuSeparator />
          {totalRows > 0 && (
            <>
              <MenuItem
                className="flex items-center justify-between"
                disabled={totalRows < 1}
                onClick={() => exportToPDF(20)}
              >
                <span>{t("firstRecords", { count: 20 })}</span>
                <Badge className="text-xs" variant="secondary">
                  {Math.min(20, totalRows)}
                </Badge>
              </MenuItem>
              <MenuItem
                className="flex items-center justify-between"
                disabled={totalRows < 1}
                onClick={() => exportToPDF(50)}
              >
                <span>{t("firstRecords", { count: 50 })}</span>
                <Badge className="text-xs" variant="secondary">
                  {Math.min(50, totalRows)}
                </Badge>
              </MenuItem>
              <MenuItem
                className="flex items-center justify-between"
                disabled={totalRows < 1}
                onClick={() => exportToPDF(70)}
              >
                <span>{t("firstRecords", { count: 70 })}</span>
                <Badge className="text-xs" variant="secondary">
                  {Math.min(70, totalRows)}
                </Badge>
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                className="flex items-center justify-between font-medium"
                onClick={() => exportToPDF()}
              >
                <span>{t("allRecords")}</span>
                <Badge className="text-xs" variant="default">
                  {totalRows}
                </Badge>
              </MenuItem>
            </>
          )}
          {totalRows === 0 && (
            <MenuItem disabled>{t("noDataToExport")}</MenuItem>
          )}
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}
