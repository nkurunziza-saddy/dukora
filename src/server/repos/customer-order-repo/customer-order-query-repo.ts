"use cache";

import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { customerOrderItemsTable, customerOrdersTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
  search?: string,
  status?: string
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
          like(customerOrdersTable.customerName, `%${search}%`)
        )!
      );
    }

    if (status) {
      whereConditions.push(eq(customerOrdersTable.status, status));
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
      .select()
      .from(customerOrderItemsTable)
      .where(eq(customerOrderItemsTable.customerOrderId, orderId));

    return { data: items, error: null };
  } catch (error) {
    console.error("Failed to get customer order items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_by_stripe_payment_intent = async (
  stripePaymentIntentId: string
) => {
  if (!stripePaymentIntentId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const order = await db
      .select()
      .from(customerOrdersTable)
      .where(
        eq(customerOrdersTable.stripePaymentIntentId, stripePaymentIntentId)
      )
      .limit(1);

    if (!order[0]) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: order[0], error: null };
  } catch (error) {
    console.error(
      "Failed to get customer order by Stripe payment intent:",
      error
    );
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
