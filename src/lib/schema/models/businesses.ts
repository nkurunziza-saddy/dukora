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

export const businessesTable = pgTable(
  "businesses",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    domain: text("domain").unique(),
    businessType: text("business_type"),
    logoUrl: text("logo_url"),
    registrationNumber: text("registration_number").unique(),
    stripeAccountId: text("stripe_account_id"),
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
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    key: text("key").notNull(),
    value: json("value").notNull(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
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
