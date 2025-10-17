import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  json,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { userRoleEnum } from "./enums";

export const usersTable = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    password: text("password"),
    emailVerified: boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    image: text("image"),
    role: userRoleEnum("role").notNull().default("VIEW_ONLY"),
    businessId: text("business_id").references(() => businessesTable.id, {
      onDelete: "cascade",
    }),
    lang: text("lang").$defaultFn(() => "en"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_business_id_email").on(table.businessId, table.email),
    check(
      "email_format",
      sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`,
    ),
    index("users_business_id").on(table.businessId),
    index("users_email").on(table.email),
  ],
);

export const userSettingsTable = pgTable(
  "user_settings",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
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
    uniqueIndex("user_settings_user_id_key").on(table.userId, table.key),
  ],
);
