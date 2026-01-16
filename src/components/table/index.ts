// =============================================================================
// TABLE COMPONENTS - PUBLIC API
// =============================================================================

// Core sub-components
export {
  DataTableBody,
  DataTableEmpty,
  DataTableHeader,
  DataTableRow,
} from "./core";
// Main table component
export { DataTable } from "./data-table";
export { DataTableColumnHeader } from "./data-table-column-header";
export {
  DataTableDashFilter,
  DataTableFacetedFilter,
} from "./data-table-faceted-filter";
// Controls
export { DataTablePagination } from "./data-table-pagination";
export { DataTableSearch } from "./data-table-search";
export {
  DataTableToolbar,
  DefaultDataTableToolbar,
} from "./data-table-toolbar";
export { DataTableViewOptions } from "./data-table-view-options";
// Types
export type {
  DataTableBodyProps,
  DataTableCallbacks,
  DataTableHeaderProps,
  DataTableProps,
  DataTableRowProps,
  DataTableState,
  FacetedFilterConfig,
  FacetedFilterOption,
  ToolbarRenderProps,
  ToolbarSlots,
  VirtualizationConfig,
} from "./types";
export { DEFAULT_TABLE_STATE, PAGE_SIZES } from "./types";
// Virtualized table for large datasets
export {
  useColumnVirtualizer,
  useTableVirtualizer,
  VirtualizedDataTable,
} from "./virtualized";
