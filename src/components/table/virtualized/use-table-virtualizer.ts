"use client";

import type { Row, Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

interface UseTableVirtualizerOptions<TData> {
  /** The table instance */
  table: Table<TData>;
  /** Container element ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Estimated row height in pixels */
  estimateSize?: number;
  /** Number of rows to render outside viewport */
  overscan?: number;
  /** Enable dynamic row measurement */
  measureDynamicRowHeight?: boolean;
}

interface UseTableVirtualizerReturn<TData> {
  /** Virtual rows to render */
  virtualRows: Array<{
    index: number;
    start: number;
    size: number;
    key: string;
    row: Row<TData>;
  }>;
  /** Total height for the virtual container */
  totalSize: number;
  /** Measure element for dynamic row heights */
  measureElement: ((node: HTMLElement | null) => void) | undefined;
  /** Get transform style for a row */
  getRowStyle: (virtualRow: {
    start: number;
    index: number;
    size: number;
  }) => React.CSSProperties;
}

/**
 * Hook for virtualizing table rows.
 * Provides virtual rows for efficient rendering of large datasets.
 */
export function useTableVirtualizer<TData>({
  table,
  containerRef,
  estimateSize = 40,
  overscan = 10,
  measureDynamicRowHeight = true,
}: UseTableVirtualizerOptions<TData>): UseTableVirtualizerReturn<TData> {
  const { rows } = table.getRowModel();

  // Detect Firefox for measurement workaround
  const isFirefox =
    typeof window !== "undefined" &&
    navigator.userAgent.indexOf("Firefox") !== -1;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateSize,
    overscan,
    // Dynamic row height measurement (disabled in Firefox due to table border measurement issues)
    measureElement:
      measureDynamicRowHeight && !isFirefox
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  const virtualRows = virtualizer.getVirtualItems().map((virtualRow) => ({
    index: virtualRow.index,
    start: virtualRow.start,
    size: virtualRow.size,
    key: virtualRow.key as string,
    row: rows[virtualRow.index],
  }));

  const getRowStyle = React.useCallback(
    (virtualRow: {
      start: number;
      index: number;
      size: number;
    }): React.CSSProperties => ({
      height: `${virtualRow.size}px`,
      transform: `translateY(${virtualRow.start - virtualRow.index * virtualRow.size}px)`,
    }),
    []
  );

  return {
    virtualRows,
    totalSize: virtualizer.getTotalSize(),
    measureElement: measureDynamicRowHeight
      ? virtualizer.measureElement
      : undefined,
    getRowStyle,
  };
}

/**
 * Hook for virtualizing table columns.
 * Useful for tables with many columns.
 */
export function useColumnVirtualizer<TData>({
  table,
  containerRef,
  overscan = 3,
}: {
  table: Table<TData>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  overscan?: number;
}) {
  const visibleColumns = table.getVisibleLeafColumns();

  const columnVirtualizer = useVirtualizer({
    count: visibleColumns.length,
    estimateSize: (index) => visibleColumns[index].getSize(),
    getScrollElement: () => containerRef.current,
    horizontal: true,
    overscan,
  });

  const virtualColumns = columnVirtualizer.getVirtualItems();

  // Calculate padding for virtualized scroll
  const virtualPaddingLeft = virtualColumns[0]?.start ?? 0;
  const virtualPaddingRight =
    columnVirtualizer.getTotalSize() -
    (virtualColumns[virtualColumns.length - 1]?.end ?? 0);

  return {
    virtualColumns,
    virtualPaddingLeft,
    virtualPaddingRight,
    totalSize: columnVirtualizer.getTotalSize(),
    visibleColumns,
  };
}
