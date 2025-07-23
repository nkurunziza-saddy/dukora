import {
  pgTable,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { sql } from "drizzle-orm";
import { productsTable } from "@/lib/schema/models";

export const warehousesTable = pgTable(
  "warehouses",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull().unique(),
    code: text("code").notNull().unique(),
    address: text("address"),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
  },
  (table) => [
    uniqueIndex("warehouses_business_id_code").on(table.businessId, table.code),
    index("warehouses_business_id").on(table.businessId),
  ]
);

export const warehouseItemsTable = pgTable(
  "warehouse_items",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    productId: text("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    warehouseId: text("warehouse_id")
      .notNull()
      .references(() => warehousesTable.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(0),
    reservedQty: integer("reserved_qty").notNull().default(0),
    lastUpdated: timestamp("last_updated", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("warehouse_items_product_id_warehouse_id").on(
      table.productId,
      table.warehouseId
    ),
    check("quantity_non_negative", sql`${table.quantity} >= 0`),
    check("reserved_qty_non_negative", sql`${table.reservedQty} >= 0`),
    check(
      "reserved_qty_lte_quantity",
      sql`${table.reservedQty} <= ${table.quantity}`
    ),
    index("warehouse_items_product_id").on(table.productId),
    index("warehouse_items_warehouse_id").on(table.warehouseId),
  ]
);
