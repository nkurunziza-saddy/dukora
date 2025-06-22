import {
  pgTable,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  check,
  json,
} from "drizzle-orm/pg-core";
import { businessTable } from "./business";
import { sql } from "drizzle-orm";
import { userRoleEnum } from "./enums";

export const businessUserTable = pgTable(
  "business_users",
  {
    id: text("id").primaryKey().notNull(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    password: text("password").notNull(),
    role: userRoleEnum("role").notNull().default("WAREHOUSE_OPERATIVE"),
    businessId: text("business_id")
      .notNull()
      .references(() => businessTable.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("business_users_business_id_email").on(
      table.businessId,
      table.email
    ),
    check(
      "email_format",
      sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`
    ),
    index("business_users_business_id").on(table.businessId),
    index("business_users_email").on(table.email),
  ]
);

export const businessUserSettingsTable = pgTable(
  "business_user_settings",
  {
    id: text("id").primaryKey().notNull(),
    businessUserId: text("business_user_id")
      .notNull()
      .references(() => businessUserTable.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: json("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("business_user_settings_user_id_key").on(
      table.businessUserId,
      table.key
    ),
  ]
);
