import {
  pgTable,
  text,
  numeric,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { sql } from "drizzle-orm";

export const metricsTable = pgTable(
  "metrics",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    periodType: text("period_type").notNull().default("monthly"),
    period: timestamp("period", { withTimezone: true }).notNull(),
    value: numeric("value", { precision: 18, scale: 4 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("metrics_business_id_name_period_type_period").on(
      table.businessId,
      table.name,
      table.periodType,
      table.period
    ),
  ]
);
