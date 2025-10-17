import { sql } from "drizzle-orm";
import { index, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { usersTable } from "./users";

export const auditLogsTable = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    model: text("model").notNull(),
    recordId: text("record_id").notNull(),
    action: text("action").notNull(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    changes: json("changes").notNull(),
    performedBy: text("performed_by")
      .notNull()
      .references(() => usersTable.id),
    performedAt: timestamp("performed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_model_record_id").on(table.model, table.recordId),
    index("audit_logs_business_id").on(table.businessId),
    index("audit_logs_performed_by").on(table.performedBy),
    index("audit_logs_performed_at").on(table.performedAt),
  ],
);
