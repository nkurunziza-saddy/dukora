import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businessesTable } from "@/lib/schema/models/businesses";
import { userRoleEnum } from "@/lib/schema/models/enums";
import { usersTable } from "./users";
export const invitationsTable = pgTable(
  "invitations",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    name: text("name"),
    role: userRoleEnum("role").notNull().default("VIEW_ONLY"),
    businessId: text("business_id").references(() => businessesTable.id, {
      onDelete: "cascade",
    }),
    invitedBy: text("invited_by").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    code: text("code"),
    isAccepted: boolean("is_active").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("invitations_business_id_email").on(
      table.businessId,
      table.email,
    ),
    check(
      "email_format",
      sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`,
    ),
    index("invitations_business_id").on(table.businessId),
    index("invitations_email").on(table.email),
  ],
);
