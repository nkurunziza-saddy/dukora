import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { orderStatusEnum } from "./enums";
import { productsTable } from "./products";
import { suppliersTable } from "./suppliers";
import { usersTable } from "./users";

export const saleOrdersTable = pgTable(
  "sales_orders",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    orderNumber: text("order_number").notNull(),
    status: orderStatusEnum("status").notNull().default("DRAFT"),
    orderDate: timestamp("order_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    note: text("note"),
    createdBy: text("created_by")
      .notNull()
      .references(() => usersTable.id),
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
      table.orderNumber,
    ),
    check("total_amount_positive", sql`${table.totalAmount} >= 0`),
    check("discount_amount_non_negative", sql`${table.discountAmount} >= 0`),
    check("tax_amount_non_negative", sql`${table.taxAmount} >= 0`),
    index("sales_orders_business_id").on(table.businessId),
    index("sales_orders_status").on(table.status),
    index("sales_orders_order_date").on(table.orderDate),
  ],
);

export const purchaseOrdersTable = pgTable(
  "purchase_orders",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    orderNumber: text("order_number").notNull(),
    status: orderStatusEnum("status").notNull().default("DRAFT"),
    orderDate: timestamp("order_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    note: text("note"),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => suppliersTable.id),
    createdBy: text("created_by")
      .notNull()
      .references(() => usersTable.id),
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
      table.orderNumber,
    ),
    check("total_amount_positive", sql`${table.totalAmount} >= 0`),
    index("purchase_orders_business_id").on(table.businessId),
    index("purchase_orders_supplier_id").on(table.supplierId),
  ],
);

export const saleOrderItemsTable = pgTable(
  "sales_order_items",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    salesOrderId: text("sales_order_id")
      .notNull()
      .references(() => saleOrdersTable.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => productsTable.id),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    note: text("note"),
  },
  (table) => [
    check("quantity_positive", sql`${table.quantity} > 0`),
    check("unit_price_positive", sql`${table.unitPrice} > 0`),
    check("discount_non_negative", sql`${table.discount} >= 0`),
    index("sales_order_items_sales_order_id").on(table.salesOrderId),
    index("sales_order_items_product_id").on(table.productId),
  ],
);

export const purchaseOrderItemsTable = pgTable(
  "purchase_order_items",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    purchaseOrderId: text("purchase_order_id")
      .notNull()
      .references(() => purchaseOrdersTable.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => productsTable.id),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    note: text("note"),
  },
  (table) => [
    check("quantity_positive", sql`${table.quantity} > 0`),
    check("unit_price_positive", sql`${table.unitPrice} > 0`),
    check("discount_non_negative", sql`${table.discount} >= 0`),
    index("purchase_order_items_purchase_order_id").on(table.purchaseOrderId),
    index("purchase_order_items_product_id").on(table.productId),
  ],
);
