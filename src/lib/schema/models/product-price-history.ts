import {
  pgTable,
  numeric,
  timestamp,
  index,
  check,
  text,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { productsTable } from "./products";
import { usersTable } from "./users";

export const productPriceHistoryTable = pgTable(
  "product_price_history",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    productId: text("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    costPrice: numeric("cost_price", { precision: 10, scale: 2 }).notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by")
      .notNull()
      .references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("price_positive", sql`${table.price} >= 0`),
    check("cost_price_positive", sql`${table.costPrice} >= 0`),
    index("product_price_history_product_id").on(table.productId),
    index("product_price_history_effective_from").on(table.effectiveFrom),
  ]
);
