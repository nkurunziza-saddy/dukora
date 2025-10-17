import { sql } from "drizzle-orm";
import {
  check,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";

export const profitReportsTable = pgTable(
  "profit_reports",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    periodType: text("period_type").notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    revenue: numeric("revenue", { precision: 12, scale: 2 }).notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
    profit: numeric("profit", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("profit_reports_business_id_period_type_period_start").on(
      table.businessId,
      table.periodType,
      table.periodStart,
    ),
    check(
      "period_end_after_start",
      sql`${table.periodEnd} > ${table.periodStart}`,
    ),
  ],
);
