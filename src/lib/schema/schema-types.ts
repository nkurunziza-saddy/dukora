import * as schema from "./models";

export type SelectBusiness = typeof schema.businessesTable.$inferSelect;
export type SelectBusinessSetting =
  typeof schema.businessSettingsTable.$inferSelect;
export type SelectUser = typeof schema.usersTable.$inferSelect;
export type SelectUserSetting = typeof schema.userSettingsTable.$inferSelect;
export type SelectCategory = typeof schema.categoriesTable.$inferSelect;
export type SelectProductAttribute =
  typeof schema.productAttributesTable.$inferSelect;
export type SelectProductAttributeValue =
  typeof schema.productAttributeValuesTable.$inferSelect;
export type SelectProduct = typeof schema.productsTable.$inferSelect;
export type SelectProductTag = typeof schema.productTagsTable.$inferSelect;
export type SelectProductProductTag =
  typeof schema.productProductTagsTable.$inferSelect;
export type SelectProductVariant =
  typeof schema.productVariantsTable.$inferSelect;
export type SelectWarehouse = typeof schema.warehousesTable.$inferSelect;
export type SelectWarehouseItem =
  typeof schema.warehouseItemsTable.$inferSelect;
export type SelectSupplier = typeof schema.suppliersTable.$inferSelect;
export type SelectProductSupplier =
  typeof schema.productSuppliersTable.$inferSelect;
export type SelectSalesOrder = typeof schema.saleOrdersTable.$inferSelect;
export type SelectPurchaseOrder =
  typeof schema.purchaseOrdersTable.$inferSelect;
export type SelectSalesOrderItem =
  typeof schema.saleOrderItemsTable.$inferSelect;
export type SelectPurchaseOrderItem =
  typeof schema.purchaseOrderItemsTable.$inferSelect;
export type SelectProfitReport = typeof schema.profitReportsTable.$inferSelect;
export type SelectMetric = typeof schema.metricsTable.$inferSelect;
export type SelectAuditLog = typeof schema.auditLogsTable.$inferSelect;
export type SelectTransaction = typeof schema.transactionsTable.$inferSelect;
export type SelectProductPriceHistory =
  typeof schema.productPriceHistoryTable.$inferSelect;

export type InsertBusiness = typeof schema.businessesTable.$inferInsert;
export type InsertBusinessSetting =
  typeof schema.businessSettingsTable.$inferInsert;
export type InsertUser = typeof schema.usersTable.$inferInsert;
export type InsertUserSetting = typeof schema.userSettingsTable.$inferInsert;
export type InsertCategory = typeof schema.categoriesTable.$inferInsert;
export type InsertProductAttribute =
  typeof schema.productAttributesTable.$inferInsert;
export type InsertProductAttributeValue =
  typeof schema.productAttributeValuesTable.$inferInsert;
export type InsertProduct = typeof schema.productsTable.$inferInsert;
export type InsertProductTag = typeof schema.productTagsTable.$inferInsert;
export type InsertProductProductTag =
  typeof schema.productProductTagsTable.$inferInsert;
export type InsertProductVariant =
  typeof schema.productVariantsTable.$inferInsert;
export type InsertWarehouse = typeof schema.warehousesTable.$inferInsert;
export type InsertWarehouseItem =
  typeof schema.warehouseItemsTable.$inferInsert;
export type InsertSupplier = typeof schema.suppliersTable.$inferInsert;
export type InsertProductSupplier =
  typeof schema.productSuppliersTable.$inferInsert;
export type InsertSalesOrder = typeof schema.saleOrdersTable.$inferInsert;
export type InsertPurchaseOrder =
  typeof schema.purchaseOrdersTable.$inferInsert;
export type InsertSalesOrderItem =
  typeof schema.saleOrderItemsTable.$inferInsert;
export type InsertPurchaseOrderItem =
  typeof schema.purchaseOrderItemsTable.$inferInsert;
export type InsertProfitReport = typeof schema.profitReportsTable.$inferInsert;
export type InsertMetric = typeof schema.metricsTable.$inferInsert;
export type InsertAuditLog = typeof schema.auditLogsTable.$inferInsert;
export type InsertTransaction = typeof schema.transactionsTable.$inferInsert;
export type InsertProductPriceHistory =
  typeof schema.productPriceHistoryTable.$inferInsert;

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

// Payloads

export type ExtendedProductPayload = SelectProduct & {
  category: SelectCategory;
  productVariants: SelectProductVariant[];
  // productSuppliers: SelectProductSupplier[];
  // productPriceHistory: SelectProductPriceHistory[];
  transactions: SelectTransaction[];
  warehouseItems: (SelectWarehouseItem & {
    warehouse: SelectWarehouse;
  })[];
};
export type ExtendedTransactionPayload = SelectTransaction & {
  product: SelectProduct;
  createdByUser: SelectUser;
};
