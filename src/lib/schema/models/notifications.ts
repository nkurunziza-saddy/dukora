import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  json,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { usersTable } from "./users";

export const notificationsTable = pgTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    type: text("type").notNull(), // 'payment', 'inventory', 'order', 'system', 'warning'
    priority: text("priority").notNull(), // 'low', 'medium', 'high'
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: json("data"), // Additional data for the notification
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => [
    index("notifications_business_id").on(table.businessId),
    index("notifications_user_id").on(table.userId),
    index("notifications_type").on(table.type),
    index("notifications_priority").on(table.priority),
    index("notifications_read").on(table.read),
    index("notifications_created_at").on(table.createdAt),
  ]
);
