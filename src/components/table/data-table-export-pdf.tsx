"use client";

import React, { useState } from "react";
import { Table } from "@tanstack/react-table";
import { Download, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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

      // Get visible columns (excluding select and actions columns)
      const visibleColumns = table
        .getFlatHeaders()
        .filter(
          (header) =>
            header.id !== "select" &&
            header.id !== "actions" &&
            header.column.getIsVisible()
        );

      // Create headers array
      const headers = visibleColumns.map((header) => formatKeys(header.id));

      // Create data array - map each row to array of values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = rows.map((row: any) =>
        visibleColumns.map((header) => {
          const value = row[header.id];

          // Handle special formatting for specific columns
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting || totalRows === 0}
          className="gap-2"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export PDF
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Export Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 py-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Available: {totalRows} records</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {totalRows > 0 && (
          <>
            <DropdownMenuItem
              onClick={() => exportToPDF(20)}
              disabled={totalRows < 1}
              className="flex items-center justify-between"
            >
              <span>First 20 records</span>
              <Badge variant="secondary" className="text-xs">
                {Math.min(20, totalRows)}
              </Badge>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => exportToPDF(50)}
              disabled={totalRows < 1}
              className="flex items-center justify-between"
            >
              <span>First 50 records</span>
              <Badge variant="secondary" className="text-xs">
                {Math.min(50, totalRows)}
              </Badge>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => exportToPDF(70)}
              disabled={totalRows < 1}
              className="flex items-center justify-between"
            >
              <span>First 70 records</span>
              <Badge variant="secondary" className="text-xs">
                {Math.min(70, totalRows)}
              </Badge>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => exportToPDF()}
              className="flex items-center justify-between font-medium"
            >
              <span>All records</span>
              <Badge variant="default" className="text-xs">
                {totalRows}
              </Badge>
            </DropdownMenuItem>
          </>
        )}

        {totalRows === 0 && (
          <DropdownMenuItem disabled>No data to export</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
