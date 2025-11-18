"use cache";

import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  customerOrderItemsTable,
  customerOrdersTable,
  productsTable,
  warehouseItemsTable,
} from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
  search?: string,
  status?: string,
) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;

    const whereConditions = [eq(customerOrdersTable.businessId, businessId)];

    if (search) {
      whereConditions.push(
        or(
          like(customerOrdersTable.orderNumber, `%${search}%`),
          like(customerOrdersTable.customerEmail, `%${search}%`),
          like(customerOrdersTable.customerName, `%${search}%`),
        )!,
      );
    }

    if (status) {
      whereConditions.push(eq(customerOrdersTable.status, status as any));
    }

    const [orders, totalCountResult] = await Promise.all([
      db
        .select()
        .from(customerOrdersTable)
        .where(and(...whereConditions))
        .orderBy(desc(customerOrdersTable.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(customerOrdersTable)
        .where(and(...whereConditions)),
    ]);

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      data: {
        orders,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get paginated customer orders:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_by_id = async (orderId: string) => {
  if (!orderId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const order = await db
      .select()
      .from(customerOrdersTable)
      .where(eq(customerOrdersTable.id, orderId))
      .limit(1);

    if (!order[0]) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: order[0], error: null };
  } catch (error) {
    console.error("Failed to get customer order by id:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_by_order_number = async (orderNumber: string) => {
  if (!orderNumber) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const order = await db
      .select()
      .from(customerOrdersTable)
      .where(eq(customerOrdersTable.orderNumber, orderNumber))
      .limit(1);

    if (!order[0]) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: order[0], error: null };
  } catch (error) {
    console.error("Failed to get customer order by order number:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_items_by_order_id = async (orderId: string) => {
  if (!orderId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const items = await db
      .select({
        customerOrderItem: customerOrderItemsTable,
        productName: productsTable.name,
        productId: productsTable.id,
      })
      .from(customerOrderItemsTable)
      .leftJoin(
        warehouseItemsTable,
        eq(customerOrderItemsTable.warehouseItemId, warehouseItemsTable.id),
      )
      .leftJoin(
        productsTable,
        eq(warehouseItemsTable.productId, productsTable.id),
      )
      .where(eq(customerOrderItemsTable.customerOrderId, orderId));

    return { data: items, error: null };
  } catch (error) {
    console.error("Failed to get customer order items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_by_user_id = async (userId: string) => {
  if (!userId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const orders = await db
      .select()
      .from(customerOrdersTable)
      .where(eq(customerOrdersTable.userId, userId))
      .orderBy(desc(customerOrdersTable.createdAt));

    return { data: orders, error: null };
  } catch (error) {
    console.error("Failed to get customer orders by user id:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_by_stripe_payment_intent = async (
  stripePaymentIntentId: string,
) => {
  if (!stripePaymentIntentId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const order = await db
      .select()
      .from(customerOrdersTable)
      .where(
        eq(customerOrdersTable.stripePaymentIntentId, stripePaymentIntentId),
      )
      .limit(1);

    if (!order[0]) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: order[0], error: null };
  } catch (error) {
    console.error(
      "Failed to get customer order by Stripe payment intent:",
      error,
    );
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
