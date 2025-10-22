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
            header.column.getIsVisible(),
        );

      const headers = visibleColumns.map((header) => formatKeys(header.id));

      const data = rows.map((row: any) =>
        visibleColumns.map((header) => {
          const value = row[header.id];

          switch (header.id) {
            case "status":
              return value
                ? value.charAt(0).toUpperCase() + value.slice(1)
                : "N/A";
            case "createdAt":
              return value ? new Date(value).toLocaleDateString() : "N/A";
            default:
              return value !== null && value !== undefined
                ? String(value)
                : "N/A";
          }
        }),
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
          doc.internal.pageSize.getHeight() - 10,
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
            variant="outline"
            size="sm"
            disabled={isExporting || totalRows === 0}
            className="gap-2"
          />
        }
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full size-3.5 border-b-2 border-current"></div>
            {t("exporting")}
          </>
        ) : (
          <>
            <DownloadIcon className="size-3.5" />
            {t("export")}
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
                onClick={() => exportToPDF(20)}
                disabled={totalRows < 1}
                className="flex items-center justify-between"
              >
                <span>{t("firstRecords", { count: 20 })}</span>
                <Badge variant="secondary" className="text-xs">
                  {Math.min(20, totalRows)}
                </Badge>
              </MenuItem>
              <MenuItem
                onClick={() => exportToPDF(50)}
                disabled={totalRows < 1}
                className="flex items-center justify-between"
              >
                <span>{t("firstRecords", { count: 50 })}</span>
                <Badge variant="secondary" className="text-xs">
                  {Math.min(50, totalRows)}
                </Badge>
              </MenuItem>
              <MenuItem
                onClick={() => exportToPDF(70)}
                disabled={totalRows < 1}
                className="flex items-center justify-between"
              >
                <span>{t("firstRecords", { count: 70 })}</span>
                <Badge variant="secondary" className="text-xs">
                  {Math.min(70, totalRows)}
                </Badge>
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                onClick={() => exportToPDF()}
                className="flex items-center justify-between font-medium"
              >
                <span>{t("allRecords")}</span>
                <Badge variant="default" className="text-xs">
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
