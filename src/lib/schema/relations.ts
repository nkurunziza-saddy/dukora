import { relations } from "drizzle-orm";
import {
  businessesTable,
  usersTable,
  categoriesTable,
  productsTable,
  warehousesTable,
  businessSettingsTable,
  productSuppliersTable,
  profitReportsTable,
  metricsTable,
  auditLogsTable,
  transactionsTable,
  userSettingsTable,
  suppliersTable,
  productVariantsTable,
  saleOrdersTable,
  purchaseOrdersTable,
  productAttributesTable,
  productAttributeValuesTable,
  productTagsTable,
  productProductTagsTable,
  warehouseItemsTable,
  productPriceHistoryTable,
  schedulesTable,
  invitationsTable,
  expensesTable,
  interBusinessPaymentsTable,
} from "./models";

export const businessesTableRelations = relations(
  businessesTable,
  ({ many }) => ({
    businessUsers: many(usersTable),
    productSuppliers: many(productSuppliersTable),
    products: many(productsTable),
    warehouses: many(warehousesTable),
    categories: many(categoriesTable),
    businessSettings: many(businessSettingsTable),
    salesOrders: many(saleOrdersTable),
    purchaseOrders: many(purchaseOrdersTable),
    profitReports: many(profitReportsTable),
    metrics: many(metricsTable),
    auditLogs: many(auditLogsTable),
    transactions: many(transactionsTable),
    schedules: many(schedulesTable),
    invitations: many(invitationsTable),
    expenses: many(expensesTable),
    payments: many(interBusinessPaymentsTable),
  })
);

export const usersTableRelations = relations(usersTable, ({ one, many }) => ({
  business: one(businessesTable, {
    fields: [usersTable.businessId],
    references: [businessesTable.id],
  }),
  businessUserSettings: many(userSettingsTable),
  auditLogs: many(auditLogsTable),
  schedules: many(schedulesTable),
  invitations: many(invitationsTable),
  transactions: many(transactionsTable),
  expenses: many(expensesTable),
}));

export const categoriesTableRelations = relations(
  categoriesTable,
  ({ one, many }) => ({
    business: one(businessesTable, {
      fields: [categoriesTable.businessId],
      references: [businessesTable.id],
    }),
    products: many(productsTable),
  })
);

export const productsTableRelations = relations(
  productsTable,
  ({ one, many }) => ({
    business: one(businessesTable, {
      fields: [productsTable.businessId],
      references: [businessesTable.id],
    }),
    category: one(categoriesTable, {
      fields: [productsTable.categoryId],
      references: [categoriesTable.id],
    }),
    productSuppliers: many(productSuppliersTable),
    productVariants: many(productVariantsTable),
    transactions: many(transactionsTable),
    productPriceHistory: many(productPriceHistoryTable),
    warehouseItems: many(warehouseItemsTable),
  })
);

export const warehousesTableRelations = relations(
  warehousesTable,
  ({ one, many }) => ({
    business: one(businessesTable, {
      fields: [warehousesTable.businessId],
      references: [businessesTable.id],
    }),
    transactions: many(transactionsTable),
    warehouseItems: many(warehouseItemsTable),
  })
);

export const productVariantsTableRelations = relations(
  productVariantsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productVariantsTable.productId],
      references: [productsTable.id],
    }),
    attributeValue: one(productAttributeValuesTable, {
      fields: [productVariantsTable.attributeValueId],
      references: [productAttributeValuesTable.id],
    }),
  })
);

export const productSuppliersTableRelations = relations(
  productSuppliersTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productSuppliersTable.productId],
      references: [productsTable.id],
    }),
    supplier: one(suppliersTable, {
      fields: [productSuppliersTable.supplierId],
      references: [suppliersTable.id],
    }),
    business: one(businessesTable, {
      fields: [productSuppliersTable.businessId],
      references: [businessesTable.id],
    }),
  })
);

export const businessSettingsTableRelations = relations(
  businessSettingsTable,
  ({ one }) => ({
    business: one(businessesTable, {
      fields: [businessSettingsTable.businessId],
      references: [businessesTable.id],
    }),
  })
);

export const userSettingsTableRelations = relations(
  userSettingsTable,
  ({ one }) => ({
    businessUser: one(usersTable, {
      fields: [userSettingsTable.userId],
      references: [usersTable.id],
    }),
  })
);
export const invitationsTableRelations = relations(
  invitationsTable,
  ({ one }) => ({
    invitedByUser: one(usersTable, {
      fields: [invitationsTable.invitedBy],
      references: [usersTable.id],
    }),
    businessesTable: one(businessesTable, {
      fields: [invitationsTable.invitedBy],
      references: [businessesTable.id],
    }),
  })
);

export const productPriceHistoryTableRelations = relations(
  productPriceHistoryTable,
  ({ one }) => ({
    product: one(businessesTable, {
      fields: [productPriceHistoryTable.productId],
      references: [businessesTable.id],
    }),
    createdBy: one(usersTable, {
      fields: [productPriceHistoryTable.createdBy],
      references: [usersTable.id],
    }),
  })
);

export const profitReportsTableRelations = relations(
  profitReportsTable,
  ({ one }) => ({
    business: one(businessesTable, {
      fields: [profitReportsTable.businessId],
      references: [businessesTable.id],
    }),
  })
);

export const saleOrdersTableRelations = relations(
  saleOrdersTable,
  ({ one }) => ({
    business: one(businessesTable, {
      fields: [saleOrdersTable.businessId],
      references: [businessesTable.id],
    }),
    createdBy: one(usersTable, {
      fields: [saleOrdersTable.createdBy],
      references: [usersTable.id],
    }),
  })
);

export const purchaseOrdersTableRelations = relations(
  purchaseOrdersTable,
  ({ one }) => ({
    business: one(businessesTable, {
      fields: [purchaseOrdersTable.businessId],
      references: [businessesTable.id],
    }),
    suppliedBy: one(suppliersTable, {
      fields: [purchaseOrdersTable.supplierId],
      references: [suppliersTable.id],
    }),
  })
);

export const metricsTableRelations = relations(metricsTable, ({ one }) => ({
  business: one(businessesTable, {
    fields: [metricsTable.businessId],
    references: [businessesTable.id],
  }),
}));

export const auditLogsTableRelations = relations(auditLogsTable, ({ one }) => ({
  business: one(businessesTable, {
    fields: [auditLogsTable.businessId],
    references: [businessesTable.id],
  }),
  performedBy: one(usersTable, {
    fields: [auditLogsTable.performedBy],
    references: [usersTable.id],
  }),
}));
export const schedulesTableRelations = relations(schedulesTable, ({ one }) => ({
  business: one(businessesTable, {
    fields: [schedulesTable.businessId],
    references: [businessesTable.id],
  }),
  performedBy: one(usersTable, {
    fields: [schedulesTable.userId],
    references: [usersTable.id],
  }),
}));

export const transactionsRelations = relations(
  transactionsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [transactionsTable.productId],
      references: [productsTable.id],
    }),
    warehouse: one(warehousesTable, {
      fields: [transactionsTable.warehouseId],
      references: [warehousesTable.id],
    }),
    warehouseItem: one(warehouseItemsTable, {
      fields: [transactionsTable.warehouseItemId],
      references: [warehouseItemsTable.id],
    }),
    business: one(businessesTable, {
      fields: [transactionsTable.businessId],
      references: [businessesTable.id],
    }),
    createdByUser: one(usersTable, {
      fields: [transactionsTable.createdBy],
      references: [usersTable.id],
    }),
  })
);
export const expensesRelations = relations(expensesTable, ({ one }) => ({
  business: one(businessesTable, {
    fields: [expensesTable.businessId],
    references: [businessesTable.id],
  }),
  createdByUser: one(usersTable, {
    fields: [expensesTable.createdBy],
    references: [usersTable.id],
  }),
}));
export const interBusinessPaymentsRelations = relations(
  interBusinessPaymentsTable,
  ({ one }) => ({
    payer: one(businessesTable, {
      fields: [interBusinessPaymentsTable.payerBusinessId],
      references: [businessesTable.id],
    }),
    receiver: one(businessesTable, {
      fields: [interBusinessPaymentsTable.receiverBusinessId],
      references: [businessesTable.id],
    }),
  })
);

export const productAttributesTableRelations = relations(
  productAttributesTable,
  ({ one, many }) => ({
    business: one(businessesTable, {
      fields: [productAttributesTable.businessId],
      references: [businessesTable.id],
    }),
    values: many(productAttributeValuesTable),
  })
);

export const productAttributeValuesTableRelations = relations(
  productAttributeValuesTable,
  ({ one, many }) => ({
    attribute: one(productAttributesTable, {
      fields: [productAttributeValuesTable.attributeId],
      references: [productAttributesTable.id],
    }),
    productVariants: many(productVariantsTable),
  })
);

export const productTagsTableRelations = relations(
  productTagsTable,
  ({ one, many }) => ({
    business: one(businessesTable, {
      fields: [productTagsTable.businessId],
      references: [businessesTable.id],
    }),
    productProductTags: many(productProductTagsTable),
  })
);

export const productProductTagsTableRelations = relations(
  productProductTagsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productProductTagsTable.productId],
      references: [productsTable.id],
    }),
    tag: one(productTagsTable, {
      fields: [productProductTagsTable.tagId],
      references: [productTagsTable.id],
    }),
  })
);

export const warehouseItemsTableRelations = relations(
  warehouseItemsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [warehouseItemsTable.productId],
      references: [productsTable.id],
    }),
    warehouse: one(warehousesTable, {
      fields: [warehouseItemsTable.warehouseId],
      references: [warehousesTable.id],
    }),
  })
);

export const suppliersTableRelations = relations(
  suppliersTable,
  ({ one, many }) => ({
    business: one(businessesTable, {
      fields: [suppliersTable.businessId],
      references: [businessesTable.id],
    }),
    productSuppliers: many(productSuppliersTable),
  })
);
