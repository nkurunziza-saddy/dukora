import { pgTable, text, json, timestamp, index } from "drizzle-orm/pg-core";
import { businessTable } from "./business";
import { businessUserTable } from "./business-user";

export const auditLogTable = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey().notNull(),
    model: text("model").notNull(),
    recordId: text("record_id").notNull(),
    action: text("action").notNull(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessTable.id, { onDelete: "cascade" }),
    changes: json("changes").notNull(),
    performedBy: text("performed_by")
      .notNull()
      .references(() => businessUserTable.id),
    performedAt: timestamp("performed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_model_record_id").on(table.model, table.recordId),
    index("audit_logs_business_id").on(table.businessId),
    index("audit_logs_performed_by").on(table.performedBy),
    index("audit_logs_performed_at").on(table.performedAt),
  ]
);
