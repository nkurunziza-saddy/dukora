"use cache";

import { and, count, desc, eq, like, or, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  customerOrderItemsTable,
  customerOrdersTable,
  productsTable,
  warehouseItemsTable,
} from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
  search?: string,
  status?: string,
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
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
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_by_id = async (orderId: string) => {
  if (!orderId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const order = await db
      .select()
      .from(customerOrdersTable)
      .where(eq(customerOrdersTable.id, orderId))
      .limit(1);

    if (!order[0]) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: order[0], error: null };
  } catch (error) {
    console.error("Failed to get customer order by id:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_by_order_number = async (orderNumber: string) => {
  if (!orderNumber) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const order = await db
      .select()
      .from(customerOrdersTable)
      .where(eq(customerOrdersTable.orderNumber, orderNumber))
      .limit(1);

    if (!order[0]) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: order[0], error: null };
  } catch (error) {
    console.error("Failed to get customer order by order number:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_items_by_order_id = async (orderId: string) => {
  if (!orderId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
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
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_by_user_id = async (userId: string) => {
  if (!userId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
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
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_by_stripe_payment_intent = async (
  stripePaymentIntentId: string,
) => {
  if (!stripePaymentIntentId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
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
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: order[0], error: null };
  } catch (error) {
    console.error(
      "Failed to get customer order by Stripe payment intent:",
      error,
    );
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_user_orders = async ({
  userId,
  email,
  page = 1,
  pageSize = 10,
  status,
}: {
  userId?: string;
  email?: string;
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  if (!userId && !email) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const whereConditions = [];

    if (userId) {
      whereConditions.push(eq(customerOrdersTable.userId, userId));
    } else if (email) {
      whereConditions.push(eq(customerOrdersTable.customerEmail, email));
    }

    whereConditions.push(eq(customerOrdersTable.isStoreOrder, true));

    if (status) {
      whereConditions.push(eq(customerOrdersTable.status, status as any));
    }

    const offset = (page - 1) * pageSize;

    const orders = await db
      .select({
        id: customerOrdersTable.id,
        orderNumber: customerOrdersTable.orderNumber,
        status: customerOrdersTable.status,
        totalAmount: customerOrdersTable.totalAmount,
        currency: customerOrdersTable.currency,
        createdAt: customerOrdersTable.createdAt,
        fulfillmentStatus: customerOrdersTable.fulfillmentStatus,
        trackingNumber: customerOrdersTable.trackingNumber,
        estimatedDeliveryDate: customerOrdersTable.estimatedDeliveryDate,
      })
      .from(customerOrdersTable)
      .where(and(...whereConditions))
      .orderBy(desc(customerOrdersTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(customerOrdersTable)
      .where(and(...whereConditions));

    const totalPages = Math.ceil((totalCount.count || 0) / pageSize);

    return {
      data: {
        orders,
        totalCount: totalCount.count || 0,
        totalPages,
        currentPage: page,
        pageSize,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_order_with_items = async (
  orderId: string,
  userId?: string,
) => {
  if (!orderId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const [order] = await db
      .select()
      .from(customerOrdersTable)
      .where(eq(customerOrdersTable.id, orderId));

    if (!order) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    // If userId is provided, verify the order belongs to the user
    if (userId && order.userId !== userId) {
      return { data: null, error: ERROR_CODE.UNAUTHORIZED };
    }

    // Fetch order items with product details
    const items = await db
      .select({
        id: customerOrderItemsTable.id,
        quantity: customerOrderItemsTable.quantity,
        unitPrice: customerOrderItemsTable.unitPrice,
        discount: customerOrderItemsTable.discount,
        productName: productsTable.name,
        productSku: productsTable.sku,
        productImageUrl: productsTable.imageUrl,
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

    return {
      data: {
        ...order,
        items,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch order with items:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_order_stats = async (userId?: string, email?: string) => {
  if (!userId && !email) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const whereConditions = [];

    if (userId) {
      whereConditions.push(eq(customerOrdersTable.userId, userId));
    } else if (email) {
      whereConditions.push(eq(customerOrdersTable.customerEmail, email));
    }

    whereConditions.push(eq(customerOrdersTable.isStoreOrder, true));

    const [stats] = await db
      .select({
        totalOrders: count(),
        totalSpent: sum(customerOrdersTable.totalAmount),
      })
      .from(customerOrdersTable)
      .where(and(...whereConditions));

    const [pendingCount] = await db
      .select({ count: count() })
      .from(customerOrdersTable)
      .where(
        and(
          ...whereConditions,
          sql`${customerOrdersTable.status} IN ('DRAFT', 'CONFIRMED', 'PROCESSING')`,
        ),
      );

    return {
      data: {
        totalOrders: stats.totalOrders || 0,
        totalSpent: stats.totalSpent || "0",
        pendingOrders: pendingCount.count || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch order stats:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
