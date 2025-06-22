import { relations } from "drizzle-orm";
import {
  businessTable,
  businessUserTable,
  categoryTable,
  productTable,
  warehouseTable,
  businessSettingsTable,
  productSupplierTable,
  profitReportTable,
  metricTable,
  auditLogTable,
  transactionTable,
  businessUserSettingsTable,
  supplierTable,
  productVariantTable,
  salesOrderTable,
  purchaseOrderTable,
  productAttributeTable,
  productAttributeValueTable,
  productTagTable,
  productProductTagTable,
  warehouseItemTable,
  productPriceHistoryTable,
} from "./models";

export const businessTableRelations = relations(businessTable, ({ many }) => ({
  businessUsers: many(businessUserTable),
  productSuppliers: many(productSupplierTable),
  products: many(productTable),
  warehouses: many(warehouseTable),
  categories: many(categoryTable),
  businessSettings: many(businessSettingsTable),
  salesOrders: many(salesOrderTable),
  purchaseOrders: many(purchaseOrderTable),
  profitReports: many(profitReportTable),
  metrics: many(metricTable),
  auditLogs: many(auditLogTable),
  transactions: many(transactionTable),
}));

export const businessUserTableRelations = relations(
  businessUserTable,
  ({ one, many }) => ({
    business: one(businessTable, {
      fields: [businessUserTable.businessId],
      references: [businessTable.id],
    }),
    businessUserSettings: many(businessUserSettingsTable),
    auditLogs: many(auditLogTable),
  })
);

export const categoryTableRelations = relations(
  categoryTable,
  ({ one, many }) => ({
    business: one(businessTable, {
      fields: [categoryTable.businessId],
      references: [businessTable.id],
    }),
    parent: one(categoryTable, {
      fields: [categoryTable.parentId],
      references: [categoryTable.id],
    }),
    products: many(productTable),
  })
);

export const productTableRelations = relations(
  productTable,
  ({ one, many }) => ({
    business: one(businessTable, {
      fields: [productTable.businessId],
      references: [businessTable.id],
    }),
    category: one(categoryTable, {
      fields: [productTable.categoryId],
      references: [categoryTable.id],
    }),
    productSuppliers: many(productSupplierTable),
    productVariants: many(productVariantTable),
    transactions: many(transactionTable),
    productPriceHistory: many(productPriceHistoryTable),
  })
);

export const warehouseTableRelations = relations(
  warehouseTable,
  ({ one, many }) => ({
    business: one(businessTable, {
      fields: [warehouseTable.businessId],
      references: [businessTable.id],
    }),
    transactions: many(transactionTable),
  })
);

export const productVariantTableRelations = relations(
  productVariantTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [productVariantTable.productId],
      references: [productTable.id],
    }),
    attributeValue: one(productAttributeValueTable, {
      fields: [productVariantTable.attributeValueId],
      references: [productAttributeValueTable.id],
    }),
  })
);

export const productSupplierTableRelations = relations(
  productSupplierTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [productSupplierTable.productId],
      references: [productTable.id],
    }),
    supplier: one(supplierTable, {
      fields: [productSupplierTable.supplierId],
      references: [supplierTable.id],
    }),
    business: one(businessTable, {
      fields: [productSupplierTable.businessId],
      references: [businessTable.id],
    }),
  })
);

export const businessSettingsTableRelations = relations(
  businessSettingsTable,
  ({ one }) => ({
    business: one(businessTable, {
      fields: [businessSettingsTable.businessId],
      references: [businessTable.id],
    }),
  })
);

export const businessUserSettingsTableRelations = relations(
  businessUserSettingsTable,
  ({ one }) => ({
    businessUser: one(businessUserTable, {
      fields: [businessUserSettingsTable.businessUserId],
      references: [businessUserTable.id],
    }),
  })
);

export const productPriceHistoryTableRelations = relations(
  productPriceHistoryTable,
  ({ one }) => ({
    product: one(businessTable, {
      fields: [productPriceHistoryTable.productId],
      references: [businessTable.id],
    }),
    createdBy: one(businessUserTable, {
      fields: [productPriceHistoryTable.createdBy],
      references: [businessUserTable.id],
    }),
  })
);

export const profitReportTableRelations = relations(
  profitReportTable,
  ({ one }) => ({
    business: one(businessTable, {
      fields: [profitReportTable.businessId],
      references: [businessTable.id],
    }),
  })
);

export const salesOrderTableRelations = relations(
  salesOrderTable,
  ({ one }) => ({
    business: one(businessTable, {
      fields: [salesOrderTable.businessId],
      references: [businessTable.id],
    }),
    createdBy: one(businessUserTable, {
      fields: [salesOrderTable.createdBy],
      references: [businessUserTable.id],
    }),
  })
);

export const purchaseOrderTableRelations = relations(
  purchaseOrderTable,
  ({ one }) => ({
    business: one(businessTable, {
      fields: [purchaseOrderTable.businessId],
      references: [businessTable.id],
    }),
    suppliedBy: one(supplierTable, {
      fields: [purchaseOrderTable.supplierId],
      references: [supplierTable.id],
    }),
  })
);

export const metricTableRelations = relations(metricTable, ({ one }) => ({
  business: one(businessTable, {
    fields: [metricTable.businessId],
    references: [businessTable.id],
  }),
}));

export const auditLogTableRelations = relations(auditLogTable, ({ one }) => ({
  business: one(businessTable, {
    fields: [auditLogTable.businessId],
    references: [businessTable.id],
  }),
  performedBy: one(businessUserTable, {
    fields: [auditLogTable.performedBy],
    references: [businessUserTable.id],
  }),
}));

export const transactionsRelations = relations(transactionTable, ({ one }) => ({
  product: one(productTable, {
    fields: [transactionTable.productId],
    references: [productTable.id],
  }),
  warehouse: one(warehouseTable, {
    fields: [transactionTable.warehouseId],
    references: [warehouseTable.id],
  }),
  business: one(businessTable, {
    fields: [transactionTable.businessId],
    references: [businessTable.id],
  }),
  createdBy: one(businessUserTable, {
    fields: [transactionTable.createdBy],
    references: [businessUserTable.id],
  }),
}));

export const productAttributeTableRelations = relations(
  productAttributeTable,
  ({ one, many }) => ({
    business: one(businessTable, {
      fields: [productAttributeTable.businessId],
      references: [businessTable.id],
    }),
    values: many(productAttributeValueTable),
  })
);

export const productAttributeValueTableRelations = relations(
  productAttributeValueTable,
  ({ one, many }) => ({
    attribute: one(productAttributeTable, {
      fields: [productAttributeValueTable.attributeId],
      references: [productAttributeTable.id],
    }),
    productVariants: many(productVariantTable),
  })
);

export const productTagTableRelations = relations(
  productTagTable,
  ({ one, many }) => ({
    business: one(businessTable, {
      fields: [productTagTable.businessId],
      references: [businessTable.id],
    }),
    productProductTags: many(productProductTagTable),
  })
);

export const productProductTagTableRelations = relations(
  productProductTagTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [productProductTagTable.productId],
      references: [productTable.id],
    }),
    tag: one(productTagTable, {
      fields: [productProductTagTable.tagId],
      references: [productTagTable.id],
    }),
  })
);

export const warehouseItemTableRelations = relations(
  warehouseItemTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [warehouseItemTable.productId],
      references: [productTable.id],
    }),
    warehouse: one(warehouseTable, {
      fields: [warehouseItemTable.warehouseId],
      references: [warehouseTable.id],
    }),
  })
);

export const supplierTableRelations = relations(
  supplierTable,
  ({ one, many }) => ({
    business: one(businessTable, {
      fields: [supplierTable.businessId],
      references: [businessTable.id],
    }),
    productSuppliers: many(productSupplierTable),
  })
);
