import { sql } from "drizzle-orm";
import { index, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { usersTable } from "./users";

export const interBusinessPaymentsTable = pgTable(
  "inter_business_payments",
  {
    id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
    payerBusinessId: text("payer_business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    receiverBusinessId: text("receiver_business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    stripeChargeId: text("stripe_charge_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    status: text("status").notNull(), // e.g., 'pending', 'succeeded', 'failed'
    applicationFeeAmount: numeric("application_fee_amount", {
      precision: 12,
      scale: 2,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    initiatedByUserId: text("initiated_by_user_id")
      .notNull()
      .references(() => usersTable.id),
  },
  (table) => [
    index("inter_business_payments_payer_business_id").on(
      table.payerBusinessId,
    ),
    index("inter_business_payments_receiver_business_id").on(
      table.receiverBusinessId,
    ),
    index("inter_business_payments_status").on(table.status),
    index("inter_business_payments_initiated_by_user_id").on(
      table.initiatedByUserId,
    ),
  ],
);
