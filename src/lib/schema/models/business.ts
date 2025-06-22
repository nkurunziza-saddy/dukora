import {
  pgTable,
  text,
  boolean,
  timestamp,
  check,
  json,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const businessTable = pgTable(
  "businesses",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    domain: text("domain").unique().notNull(),
    logoUrl: text("logo_url"),
    registrationNumber: text("registration_number").unique().notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "domain_format",
      sql`${table.domain} ~* '^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})+$'`
    ),
  ]
);

export const businessSettingsTable = pgTable(
  "business_settings",
  {
    id: text("id").primaryKey().notNull(),
    key: text("key").notNull(),
    value: json("value").notNull(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessTable.id, { onDelete: "cascade" }),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("business_settings_business_id_key").on(
      table.businessId,
      table.key
    ),
    index("business_settings_business_id").on(table.businessId),
  ]
);
