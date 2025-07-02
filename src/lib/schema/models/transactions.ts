import {
  pgTable,
  text,
  integer,
  timestamp,
  index,
  check,
  numeric,
} from "drizzle-orm/pg-core";
import { productsTable } from "./products";
import { warehouseItemsTable, warehousesTable } from "./warehouses";
import { businessesTable } from "./businesses";
import { usersTable } from "./users";
import { sql } from "drizzle-orm";
import { transactionType } from "./enums";

export const transactionsTable = pgTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    productId: text("product_id")
      .notNull()
      .references(() => productsTable.id),
    warehouseId: text("warehouse_id")
      .notNull()
      .references(() => warehousesTable.id),
    warehouseItemId: text("warehouse_item_id")
      .notNull()
      .references(() => warehouseItemsTable.id),
    type: transactionType("type").notNull(),
    quantity: integer("quantity").notNull(),
    reference: text("reference"),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    supplierId: text("supplier_id")
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by")
      .notNull()
      .references(() => usersTable.id),
  },
  (table) => [
    check("quantity_not_zero", sql`${table.quantity} != 0`),
    index("transactions_product_id").on(table.productId),
    index("transactions_warehouse_id").on(table.warehouseId),
    index("transactions_warehouse_item_id").on(table.warehouseItemId),
    index("transactions_business_id").on(table.businessId),
    index("transactions_supplier_id").on(table.supplierId),
    index("transactions_created_at").on(table.createdAt),
    index("transactions_type").on(table.type),
  ]
);

export const expensesTable = pgTable(
  "expenses",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    reference: text("reference"),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by")
      .notNull()
      .references(() => usersTable.id),
  },
  (table) => [
    check("quantity_not_zero", sql`${table.amount} != 0`),
    index("expenses_business_id").on(table.businessId),
    index("expenses_created_at").on(table.createdAt),
  ]
);
