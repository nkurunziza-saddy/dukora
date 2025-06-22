import * as schema from "./models";

// Select types
export type Business = typeof schema.businessTable.$inferSelect;
export type BusinessSetting = typeof schema.businessSettingsTable.$inferSelect;
export type BusinessUser = typeof schema.businessUserTable.$inferSelect;
export type BusinessUserSetting =
  typeof schema.businessUserSettingsTable.$inferSelect;
export type Category = typeof schema.categoryTable.$inferSelect;
export type ProductAttribute = typeof schema.productAttributeTable.$inferSelect;
export type ProductAttributeValue =
  typeof schema.productAttributeValueTable.$inferSelect;
export type Product = typeof schema.productTable.$inferSelect;
export type ProductTag = typeof schema.productTagTable.$inferSelect;
export type ProductProductTag =
  typeof schema.productProductTagTable.$inferSelect;
export type ProductVariant = typeof schema.productVariantTable.$inferSelect;
export type Warehouse = typeof schema.warehouseTable.$inferSelect;
export type WarehouseItem = typeof schema.warehouseItemTable.$inferSelect;
export type Supplier = typeof schema.supplierTable.$inferSelect;
export type ProductSupplier = typeof schema.productSupplierTable.$inferSelect;
export type SalesOrder = typeof schema.salesOrderTable.$inferSelect;
export type PurchaseOrder = typeof schema.purchaseOrderTable.$inferSelect;
export type SalesOrderItem = typeof schema.salesOrderItemTable.$inferSelect;
export type PurchaseOrderItem =
  typeof schema.purchaseOrderItemTable.$inferSelect;
export type ProfitReport = typeof schema.profitReportTable.$inferSelect;
export type Metric = typeof schema.metricTable.$inferSelect;
export type AuditLog = typeof schema.auditLogTable.$inferSelect;
export type Transaction = typeof schema.transactionTable.$inferSelect;
export type ProductPriceHistory =
  typeof schema.productPriceHistoryTable.$inferSelect;

// Insert types
export type BusinessInsert = typeof schema.businessTable.$inferInsert;
export type BusinessSettingInsert =
  typeof schema.businessSettingsTable.$inferInsert;
export type BusinessUserInsert = typeof schema.businessUserTable.$inferInsert;
export type BusinessUserSettingInsert =
  typeof schema.businessUserSettingsTable.$inferInsert;
export type CategoryInsert = typeof schema.categoryTable.$inferInsert;
export type ProductAttributeInsert =
  typeof schema.productAttributeTable.$inferInsert;
export type ProductAttributeValueInsert =
  typeof schema.productAttributeValueTable.$inferInsert;
export type ProductInsert = typeof schema.productTable.$inferInsert;
export type ProductTagInsert = typeof schema.productTagTable.$inferInsert;
export type ProductProductTagInsert =
  typeof schema.productProductTagTable.$inferInsert;
export type ProductVariantInsert =
  typeof schema.productVariantTable.$inferInsert;
export type WarehouseInsert = typeof schema.warehouseTable.$inferInsert;
export type WarehouseItemInsert = typeof schema.warehouseItemTable.$inferInsert;
export type SupplierInsert = typeof schema.supplierTable.$inferInsert;
export type ProductSupplierInsert =
  typeof schema.productSupplierTable.$inferInsert;
export type SalesOrderInsert = typeof schema.salesOrderTable.$inferInsert;
export type PurchaseOrderInsert = typeof schema.purchaseOrderTable.$inferInsert;
export type SalesOrderItemInsert =
  typeof schema.salesOrderItemTable.$inferInsert;
export type PurchaseOrderItemInsert =
  typeof schema.purchaseOrderItemTable.$inferInsert;
export type ProfitReportInsert = typeof schema.profitReportTable.$inferInsert;
export type MetricInsert = typeof schema.metricTable.$inferInsert;
export type AuditLogInsert = typeof schema.auditLogTable.$inferInsert;
export type TransactionInsert = typeof schema.transactionTable.$inferInsert;
export type ProductPriceHistoryInsert =
  typeof schema.productPriceHistoryTable.$inferInsert;

// Enum types

export const UserRole = schema.USER_ROLES.reduce((acc, role) => {
  acc[role] = role;
  return acc;
}, {} as Record<(typeof schema.USER_ROLES)[number], (typeof schema.USER_ROLES)[number]>);
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ProductStatus = schema.PRODUCT_STATUS.reduce((acc, role) => {
  acc[role] = role;
  return acc;
}, {} as Record<(typeof schema.PRODUCT_STATUS)[number], (typeof schema.PRODUCT_STATUS)[number]>);
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const OrderStatus = schema.ORDER_STATUS.reduce((acc, role) => {
  acc[role] = role;
  return acc;
}, {} as Record<(typeof schema.ORDER_STATUS)[number], (typeof schema.ORDER_STATUS)[number]>);
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const TransactionType = schema.TRANSACTION_TYPE.reduce((acc, role) => {
  acc[role] = role;
  return acc;
}, {} as Record<(typeof schema.TRANSACTION_TYPE)[number], (typeof schema.TRANSACTION_TYPE)[number]>);
export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];
