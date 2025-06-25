import {
  pgTable,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  index,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { productsTable } from "./products";
import { suppliersTable } from "./suppliers";
import { businessesTable } from "./businesses";

export const productSuppliersTable = pgTable(
  "product_suppliers",
  {
    productId: text("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => suppliersTable.id, { onDelete: "cascade" }),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    supplierProductCode: text("supplier_product_code"),
    note: text("note"),
    supplierPrice: numeric("supplier_price", { precision: 12, scale: 2 }),
    leadTimeDays: integer("lead_time_days"),
    isPreferred: boolean("is_preferred").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.supplierId] }),
    check(
      "supplier_price_positive",
      sql`${table.supplierPrice} IS NULL OR ${table.supplierPrice} >= 0`
    ),
    check(
      "lead_time_non_negative",
      sql`${table.leadTimeDays} IS NULL OR ${table.leadTimeDays} >= 0`
    ),
    index("product_suppliers_product_id").on(table.productId),
    index("product_suppliers_supplier_id").on(table.supplierId),
  ]
);
