"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  auditLogsTable,
  customerOrderItemsTable,
  customerOrdersTable,
} from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertCustomerOrder,
} from "@/lib/schema/schema.types";
import { ERROR_CODE } from "@/server/constants/errors";

/**
 * Generate unique order number
 */
async function generateOrderNumber(_businessId: string): Promise<string> {
  const today = new Date();
  const prefix = `ORD-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

  // Get count of orders today
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(customerOrdersTable)
    .where(sql`${customerOrdersTable.orderNumber} LIKE ${`${prefix}%`}`);

  const sequence = (result?.count || 0) + 1;
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Create store order from checkout
 */
export async function create_store_order(
  orderData: {
    businessId: string;
    userId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress: string;
    billingAddress?: string;
    items: {
      storeProductId: string;
      warehouseItemId: string;
      quantity: number;
      unitPrice: number;
    }[];
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    totalAmount: number;
    fulfillmentWarehouseId?: string;
    stripePaymentIntentId?: string;
    paymentStatus?: string;
  },
  userId: string, // Staff user creating the order
) {
  if (!orderData.businessId || !orderData.items.length) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Generate order number
      const orderNumber = await generateOrderNumber(orderData.businessId);

      const orderPayload: InsertCustomerOrder = {
        businessId: orderData.businessId,
        userId: orderData.userId,
        orderNumber,
        status: orderData.paymentStatus === "succeeded" ? "CONFIRMED" : "DRAFT",
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress || orderData.shippingAddress,
        taxAmount: orderData.taxAmount.toString(),
        shippingAmount: orderData.shippingAmount.toString(),
        discountAmount: orderData.discountAmount.toString(),
        totalAmount: orderData.totalAmount.toString(),
        stripePaymentIntentId: orderData.stripePaymentIntentId,
        fulfillmentWarehouseId: orderData.fulfillmentWarehouseId,
        fulfillmentStatus: "PENDING",
        isStoreOrder: true,
      };

      const [newOrder] = await tx
        .insert(customerOrdersTable)
        .values(orderPayload)
        .returning();

      const orderItems = orderData.items.map((item) => ({
        customerOrderId: newOrder.id,
        warehouseItemId: item.warehouseItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        discount: "0", // Can be enhanced later
      }));

      await tx.insert(customerOrderItemsTable).values(orderItems);

      // Audit log
      const auditData: InsertAuditLog = {
        businessId: orderData.businessId,
        model: "customer_order",
        recordId: newOrder.id,
        action: "create-store-order",
        changes: JSON.stringify({ orderNumber, items: orderData.items.length }),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return newOrder;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create store order:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Update order status
 */
export async function update_order_status(
  orderId: string,
  businessId: string,
  status: string,
  userId: string,
) {
  if (!orderId || !businessId || !status) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(customerOrdersTable)
        .set({
          status: status as any,
          updatedAt: new Date(),
        })
        .where(eq(customerOrdersTable.id, orderId))
        .returning();

      if (!updated) return null;

      // Audit log
      const auditData: InsertAuditLog = {
        businessId,
        model: "customer_order",
        recordId: orderId,
        action: "update-order-status",
        changes: JSON.stringify({ status }),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return updated;
    });

    if (!result) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Update fulfillment status
 */
export async function update_fulfillment_status(
  orderId: string,
  businessId: string,
  fulfillmentStatus: string,
  userId: string,
  updates?: {
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
  },
) {
  if (!orderId || !businessId || !fulfillmentStatus) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(customerOrdersTable)
        .set({
          fulfillmentStatus: fulfillmentStatus as any,
          trackingNumber: updates?.trackingNumber,
          trackingUrl: updates?.trackingUrl,
          estimatedDeliveryDate: updates?.estimatedDeliveryDate,
          actualDeliveryDate: updates?.actualDeliveryDate,
          updatedAt: new Date(),
        })
        .where(eq(customerOrdersTable.id, orderId))
        .returning();

      if (!updated) return null;

      // Audit log
      const auditData: InsertAuditLog = {
        businessId,
        model: "customer_order",
        recordId: orderId,
        action: "update-fulfillment-status",
        changes: JSON.stringify({ fulfillmentStatus, ...updates }),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return updated;
    });

    if (!result) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to update fulfillment status:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Add tracking information
 */
export async function add_tracking_info(
  orderId: string,
  businessId: string,
  trackingNumber: string,
  trackingUrl?: string,
  estimatedDeliveryDate?: Date,
  _userId?: string,
) {
  if (!orderId || !businessId || !trackingNumber) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const [updated] = await db
      .update(customerOrdersTable)
      .set({
        trackingNumber,
        trackingUrl,
        estimatedDeliveryDate,
        fulfillmentStatus: "SHIPPED",
        updatedAt: new Date(),
      })
      .where(eq(customerOrdersTable.id, orderId))
      .returning();

    if (!updated) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: updated, error: null };
  } catch (error) {
    console.error("Failed to add tracking info:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Cancel order
 */
export async function cancel_order(
  orderId: string,
  businessId: string,
  userId: string,
  cancellationReason: string,
) {
  if (!orderId || !businessId || !cancellationReason) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(customerOrdersTable)
        .set({
          status: "CANCELLED",
          cancellationReason,
          updatedAt: new Date(),
        })
        .where(eq(customerOrdersTable.id, orderId))
        .returning();

      if (!updated) return null;

      // Audit log
      const auditData: InsertAuditLog = {
        businessId,
        model: "customer_order",
        recordId: orderId,
        action: "cancel-order",
        changes: JSON.stringify({ cancellationReason }),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return updated;
    });

    if (!result) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Process refund
 */
export async function process_refund(
  orderId: string,
  businessId: string,
  refundAmount: number,
  refundStatus: "PARTIAL" | "FULL",
  userId: string,
) {
  if (!orderId || !businessId || refundAmount <= 0) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(customerOrdersTable)
        .set({
          refundAmount: refundAmount.toString(),
          refundStatus,
          status: refundStatus === "FULL" ? "CANCELLED" : "PROCESSING",
          updatedAt: new Date(),
        })
        .where(eq(customerOrdersTable.id, orderId))
        .returning();

      if (!updated) return null;

      // Audit log
      const auditData: InsertAuditLog = {
        businessId,
        model: "customer_order",
        recordId: orderId,
        action: "process-refund",
        changes: JSON.stringify({ refundAmount, refundStatus }),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return updated;
    });

    if (!result) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to process refund:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
