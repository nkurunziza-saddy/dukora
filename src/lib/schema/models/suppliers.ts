import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";

export const suppliersTable = pgTable(
  "suppliers",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address"),
    note: text("note"),
    contactName: text("contact_name"),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
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
    uniqueIndex("suppliers_business_id_email").on(
      table.businessId,
      table.email,
    ),
    uniqueIndex("suppliers_business_id_phone").on(
      table.businessId,
      table.phone,
    ),
    check(
      "email_format",
      sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`,
    ),
    index("suppliers_business_id").on(table.businessId),
  ],
);
