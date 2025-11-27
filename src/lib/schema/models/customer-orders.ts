import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { orderStatusEnum } from "./enums";
import { usersTable } from "./users";
import { warehouseItemsTable } from "./warehouses";

export const customerOrdersTable = pgTable(
  "customer_orders",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    orderNumber: text("order_number").notNull(),
    status: orderStatusEnum("status").notNull().default("DRAFT"),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone"),
    shippingAddress: json("shipping_address").notNull(),
    billingAddress: json("billing_address").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("RWF"),
    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    shippingAmount: numeric("shipping_amount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripePaymentStatus: text("stripe_payment_status"),
    guestCheckout: boolean("guest_checkout").notNull().default(true),
    userId: text("user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    fulfillmentWarehouseId: text("fulfillment_warehouse_id"),
    fulfillmentStatus: text("fulfillment_status").notNull().default("PENDING"),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    estimatedDeliveryDate: timestamp("estimated_delivery_date", {
      withTimezone: true,
    }),
    actualDeliveryDate: timestamp("actual_delivery_date", {
      withTimezone: true,
    }),
    cancellationReason: text("cancellation_reason"),
    refundAmount: numeric("refund_amount", { precision: 12, scale: 2 }),
    refundStatus: text("refund_status"),
    isStoreOrder: boolean("is_store_order").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("customer_orders_business_id_order_number").on(
      table.businessId,
      table.orderNumber
    ),
    index("customer_orders_business_id").on(table.businessId),
    index("customer_orders_customer_email").on(table.customerEmail),
    index("customer_orders_status").on(table.status),
    index("customer_orders_created_at").on(table.createdAt),
    index("customer_orders_stripe_payment_intent_id").on(
      table.stripePaymentIntentId
    ),
    index("customer_orders_fulfillment_warehouse_id").on(
      table.fulfillmentWarehouseId
    ),
    index("customer_orders_fulfillment_status").on(table.fulfillmentStatus),
    index("customer_orders_is_store_order").on(table.isStoreOrder),
    index("customer_orders_currency").on(table.currency),
  ]
);

export const customerOrderItemsTable = pgTable(
  "customer_order_items",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    customerOrderId: text("customer_order_id")
      .notNull()
      .references(() => customerOrdersTable.id, { onDelete: "cascade" }),
    warehouseItemId: text("product_id")
      .notNull()
      .references(() => warehouseItemsTable.id),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    notes: text("notes"),
  },
  (table) => [
    index("customer_order_items_customer_order_id").on(table.customerOrderId),
    index("customer_order_items_product_id").on(table.warehouseItemId),
  ]
);
