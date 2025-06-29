import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  text,
  index,
} from "drizzle-orm/pg-core";
import { businessesTable } from "@/lib/schema/models/businesses";
import { usersTable } from "./users";
import { sql } from "drizzle-orm";

export const schedulesTable = pgTable(
  "schedules",
  {
    // id: varchar("id", { length: 255 }).primaryKey().notNull().default("cuid()"),
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 255 }).notNull(),
    category: varchar("category", { length: 255 }),
    color: varchar("color", { length: 255 }).notNull().default("sky"),
    all_day: boolean("all_day").notNull().default(true),
    location: varchar("location", { length: 255 }).notNull().default("here"),
    start: timestamp("start", { withTimezone: true }).notNull(),
    end: timestamp("end", { withTimezone: true }).notNull(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("schedule_business_id_user_id").on(table.businessId, table.userId),
    index("schedule_business_id").on(table.businessId),
    index("schedule_performed_by").on(table.userId),
  ]
);
