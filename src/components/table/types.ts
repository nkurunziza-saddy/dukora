import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

// =============================================================================
// TABLE STATE TYPES
// =============================================================================

/**
 * Unified state interface for DataTable.
 * All state is controlled externally for predictable behavior.
 */
export interface DataTableState {
  /** Current pagination state */
  pagination: PaginationState;
  /** Current sorting state */
  sorting: SortingState;
  /** Current column filters */
  columnFilters: ColumnFiltersState;
  /** Global search filter */
  globalFilter: string;
  /** Column visibility settings */
  columnVisibility: VisibilityState;
  /** Row selection state */
  rowSelection: RowSelectionState;
}

/**
 * Callbacks for state changes.
 * All callbacks are required for fully controlled behavior.
 */
export interface DataTableCallbacks {
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortingChange: OnChangeFn<SortingState>;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  onGlobalFilterChange?: OnChangeFn<string>;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

// =============================================================================
// TOOLBAR TYPES
// =============================================================================

/**
 * Props passed to toolbar render functions.
 */
export interface ToolbarRenderProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  onGlobalFilterChange?: (value: string) => void;
}

/**
 * Toolbar slot configuration for composable toolbars.
 */
export interface ToolbarSlots<TData> {
  /** Custom toolbar component */
  toolbar?: (props: ToolbarRenderProps<TData>) => ReactNode;
  /** Left side slot (typically filters) */
  leftSlot?: (props: ToolbarRenderProps<TData>) => ReactNode;
  /** Right side slot (typically actions) */
  rightSlot?: (props: ToolbarRenderProps<TData>) => ReactNode;
}

// =============================================================================
// FACETED FILTER TYPES
// =============================================================================

/**
 * Option for faceted filter dropdown.
 */
export interface FacetedFilterOption {
  /** Display label */
  label: string;
  /** Filter value */
  value: string;
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Configuration for a faceted filter.
 */
export interface FacetedFilterConfig {
  /** Column ID to filter */
  columnId: string;
  /** Filter title/label */
  title: string;
  /** Available filter options */
  options: FacetedFilterOption[];
}

// =============================================================================
// MAIN TABLE PROPS
// =============================================================================

/**
 * Props for the DataTable component.
 */
export interface DataTableProps<TData, TValue> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Table data */
  data: TData[];
  /** Total row count for pagination */
  rowCount: number;
  /** Current table state */
  state: Partial<DataTableState>;
  /** State change callbacks */
  callbacks: DataTableCallbacks;
  /** Toolbar customization */
  slots?: ToolbarSlots<TData>;
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Enable row expansion */
  enableExpansion?: boolean;
  /** Custom row expansion check */
  getRowCanExpand?: (row: Row<TData>) => boolean;
  /** Render expanded row content */
  renderExpandedRow?: (row: Row<TData>) => ReactNode;
  /** Enable virtualization for large datasets */
  virtualized?: boolean;
  /** Estimated row height for virtualization */
  estimateRowHeight?: number;
  /** Container height for virtualized tables */
  containerHeight?: number | string;
  /** Custom className for the container */
  className?: string;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Show loading skeleton */
  isLoading?: boolean;
}

// =============================================================================
// VIRTUALIZATION TYPES
// =============================================================================

/**
 * Configuration for virtualized tables.
 */
export interface VirtualizationConfig {
  /** Enable row virtualization */
  enableRowVirtualization?: boolean;
  /** Enable column virtualization */
  enableColumnVirtualization?: boolean;
  /** Estimated row height in pixels */
  estimateRowHeight?: number;
  /** Overscan count - rows to render outside viewport */
  overscan?: number;
  /** Container height (required for virtualization) */
  containerHeight: number | string;
}

// =============================================================================
// ROW TYPES
// =============================================================================

/**
 * Props for the DataTableRow component.
 */
export interface DataTableRowProps<TData> {
  row: Row<TData>;
  rowIndex: number;
  isExpanded?: boolean;
  isSelected?: boolean;
  visibleColumnsCount: number;
  renderExpandedContent?: (row: Row<TData>) => ReactNode;
}

/**
 * Props for the DataTableHeader component.
 */
export interface DataTableHeaderProps<TData> {
  table: Table<TData>;
  stickyHeader?: boolean;
}

/**
 * Props for the DataTableBody component.
 */
export interface DataTableBodyProps<TData> {
  table: Table<TData>;
  columnsCount: number;
  emptyMessage?: string;
  isLoading?: boolean;
  renderExpandedRow?: (row: Row<TData>) => ReactNode;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Default state values for DataTable.
 */
export const DEFAULT_TABLE_STATE: DataTableState = {
  pagination: { pageIndex: 0, pageSize: 10 },
  sorting: [],
  columnFilters: [],
  globalFilter: "",
  columnVisibility: {},
  rowSelection: {},
};

/**
 * Default pagination sizes.
 */
export const PAGE_SIZES = [10, 20, 25, 30, 40, 50] as const;
