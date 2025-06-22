import {
  pgTable,
  text,
  integer,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { productTable } from "./product";
import { warehouseTable } from "./warehouse";
import { warehouseItemTable } from "./warehouse-item";
import { businessTable } from "./business";
import { businessUserTable } from "./business-user";
import { sql } from "drizzle-orm";
import { transactionType } from "./enums";

export const transactionTable = pgTable(
  "transactions",
  {
    id: text("id").primaryKey().notNull(),
    productId: text("product_id")
      .notNull()
      .references(() => productTable.id),
    warehouseId: text("warehouse_id")
      .notNull()
      .references(() => warehouseTable.id),
    warehouseItemId: text("warehouse_item_id")
      .notNull()
      .references(() => warehouseItemTable.id),
    type: transactionType("type").notNull(),
    quantity: integer("quantity").notNull(),
    reference: text("reference"),
    businessId: text("business_id")
      .notNull()
      .references(() => businessTable.id, { onDelete: "cascade" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by").references(() => businessUserTable.id),
  },
  (table) => [
    check("quantity_not_zero", sql`${table.quantity} != 0`),
    index("transactions_product_id").on(table.productId),
    index("transactions_warehouse_id").on(table.warehouseId),
    index("transactions_warehouse_item_id").on(table.warehouseItemId),
    index("transactions_business_id").on(table.businessId),
    index("transactions_created_at").on(table.createdAt),
    index("transactions_type").on(table.type),
  ]
);
