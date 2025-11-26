"use no cache";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customerOrderItemsTable, customerOrdersTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

import * as notificationRepo from "@/server/repos/notification-repo";

export const create_customer_order = async (orderData: {
  orderNumber: string;
  businessId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: any;
  billingAddress: any;
  totalAmount: string;
  discountAmount?: string;
  taxAmount?: string;
  shippingAmount?: string;
  stripePaymentIntentId?: string;
  stripePaymentStatus?: string;
  guestCheckout: boolean;
  userId?: string;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: string;
    discount?: string;
    notes?: string;
  }>;
}) => {
  if (!orderData.orderNumber || !orderData.businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Create the order
      const [newOrder] = await tx
        .insert(customerOrdersTable)
        .values({
          orderNumber: orderData.orderNumber,
          businessId: orderData.businessId,
          customerEmail: orderData.customerEmail,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress,
          totalAmount: orderData.totalAmount,
          discountAmount: orderData.discountAmount || "0",
          taxAmount: orderData.taxAmount || "0",
          shippingAmount: orderData.shippingAmount || "0",
          stripePaymentIntentId: orderData.stripePaymentIntentId,
          stripePaymentStatus: orderData.stripePaymentStatus,
          guestCheckout: orderData.guestCheckout,
          userId: orderData.userId,
          notes: orderData.notes,
        })
        .returning();

      // Create order items
      if (orderData.items && orderData.items.length > 0) {
        await tx.insert(customerOrderItemsTable).values(
          orderData.items.map((item) => ({
            customerOrderId: newOrder.id,
            warehouseItemId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || "0",
            notes: item.notes,
          }))
        );
      }

      // Notify business of new order
      await notificationRepo.create({
        businessId: orderData.businessId,
        type: "order",
        priority: "high",
        title: "New Order Received",
        message: `New order #${orderData.orderNumber} received from ${orderData.customerName}`,
        data: {
          orderId: newOrder.id,
          orderNumber: orderData.orderNumber,
          amount: Number(orderData.totalAmount),
        },
      });

      return newOrder;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create customer order:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const update_customer_order_status = async (
  orderId: string,
  status: string,
  stripePaymentStatus?: string
) => {
  if (!orderId || !status) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const [updatedOrder] = await db
      .update(customerOrdersTable)
      .set({
        status: status as any,
        stripePaymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(customerOrdersTable.id, orderId))
      .returning();

    if (!updatedOrder) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: updatedOrder, error: null };
  } catch (error) {
    console.error("Failed to update customer order status:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const update_customer_order_payment = async (
  orderId: string,
  stripePaymentIntentId: string,
  stripePaymentStatus: string
) => {
  if (!orderId || !stripePaymentIntentId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const [updatedOrder] = await db
      .update(customerOrdersTable)
      .set({
        stripePaymentIntentId,
        stripePaymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(customerOrdersTable.id, orderId))
      .returning();

    if (!updatedOrder) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: updatedOrder, error: null };
  } catch (error) {
    console.error("Failed to update customer order payment:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
