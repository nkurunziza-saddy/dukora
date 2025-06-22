import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  integer,
  numeric,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { orderStatusEnum } from "./enums";
import { businessTable } from "./business";
import { businessUserTable } from "./business-user";
import { supplierTable } from "./supplier";
import { productTable } from "./product";
export const salesOrderTable = pgTable(
  "sales_orders",
  {
    id: text("id").primaryKey().notNull(),
    orderNumber: text("order_number").notNull(),
    status: orderStatusEnum("status").notNull().default("DRAFT"),
    orderDate: timestamp("order_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessTable.id, { onDelete: "cascade" }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    notes: text("notes"),
    createdBy: text("created_by")
      .notNull()
      .references(() => businessUserTable.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("sales_orders_business_id_order_number").on(
      table.businessId,
      table.orderNumber
    ),
    check("total_amount_positive", sql`${table.totalAmount} >= 0`),
    check("discount_amount_non_negative", sql`${table.discountAmount} >= 0`),
    check("tax_amount_non_negative", sql`${table.taxAmount} >= 0`),
    index("sales_orders_business_id").on(table.businessId),
    index("sales_orders_status").on(table.status),
    index("sales_orders_order_date").on(table.orderDate),
  ]
);

export const purchaseOrderTable = pgTable(
  "purchase_orders",
  {
    id: text("id").primaryKey().notNull(),
    orderNumber: text("order_number").notNull(),
    status: orderStatusEnum("status").notNull().default("DRAFT"),
    orderDate: timestamp("order_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessTable.id, { onDelete: "cascade" }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    notes: text("notes"),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => supplierTable.id),
    createdBy: text("created_by")
      .notNull()
      .references(() => businessUserTable.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("purchase_orders_business_id_order_number").on(
      table.businessId,
      table.orderNumber
    ),
    check("total_amount_positive", sql`${table.totalAmount} >= 0`),
    index("purchase_orders_business_id").on(table.businessId),
    index("purchase_orders_supplier_id").on(table.supplierId),
  ]
);

export const salesOrderItemTable = pgTable(
  "sales_order_items",
  {
    id: text("id").primaryKey().notNull(),
    salesOrderId: text("sales_order_id")
      .notNull()
      .references(() => salesOrderTable.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => productTable.id),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    notes: text("notes"),
  },
  (table) => [
    check("quantity_positive", sql`${table.quantity} > 0`),
    check("unit_price_positive", sql`${table.unitPrice} > 0`),
    check("discount_non_negative", sql`${table.discount} >= 0`),
    index("sales_order_items_sales_order_id").on(table.salesOrderId),
    index("sales_order_items_product_id").on(table.productId),
  ]
);

export const purchaseOrderItemTable = pgTable(
  "purchase_order_items",
  {
    id: text("id").primaryKey().notNull(),
    purchaseOrderId: text("purchase_order_id")
      .notNull()
      .references(() => purchaseOrderTable.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => productTable.id),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    notes: text("notes"),
  },
  (table) => [
    check("quantity_positive", sql`${table.quantity} > 0`),
    check("unit_price_positive", sql`${table.unitPrice} > 0`),
    check("discount_non_negative", sql`${table.discount} >= 0`),
    index("purchase_order_items_purchase_order_id").on(table.purchaseOrderId),
    index("purchase_order_items_product_id").on(table.productId),
  ]
);
