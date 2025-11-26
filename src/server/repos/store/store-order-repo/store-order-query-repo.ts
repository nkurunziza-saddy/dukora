"use cache";

import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { customerOrdersTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

/**
 * Get store orders paginated (admin view)
 */
export const get_store_orders_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
  filters?: {
    search?: string;
    status?: string;
    fulfillmentStatus?: string;
    isStoreOrder?: boolean;
  }
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;
    const whereConditions = [
      eq(customerOrdersTable.businessId, businessId),
      eq(customerOrdersTable.isStoreOrder, filters?.isStoreOrder ?? true),
    ];

    if (filters?.search) {
      whereConditions.push(
        or(
          like(customerOrdersTable.orderNumber, `%${filters.search}%`),
          like(customerOrdersTable.customerEmail, `%${filters.search}%`),
          like(customerOrdersTable.customerName, `%${filters.search}%`)
        )!
      );
    }

    if (filters?.status) {
      whereConditions.push(
        eq(customerOrdersTable.status, filters.status as any)
      );
    }

    if (filters?.fulfillmentStatus) {
      whereConditions.push(
        eq(
          customerOrdersTable.fulfillmentStatus,
          filters.fulfillmentStatus as any
        )
      );
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
    console.error("Failed to get store orders:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get order by ID with items
 */
export const get_order_by_id = async (orderId: string, businessId: string) => {
  if (!orderId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const order = await db.query.customerOrdersTable.findFirst({
      where: and(
        eq(customerOrdersTable.id, orderId),
        eq(customerOrdersTable.businessId, businessId)
      ),
      with: {
        items: {
          with: {
            warehouseItem: {
              with: {
                product: true,
                warehouse: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: order, error: null };
  } catch (error) {
    console.error("Failed to get order by id:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get orders pending fulfillment
 */
export const get_pending_fulfillment_orders = async (
  businessId: string,
  warehouseId?: string
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const whereConditions = [
      eq(customerOrdersTable.businessId, businessId),
      eq(customerOrdersTable.isStoreOrder, true),
      or(
        eq(customerOrdersTable.fulfillmentStatus, "PENDING"),
        eq(customerOrdersTable.fulfillmentStatus, "RESERVED")
      )!,
    ];

    if (warehouseId) {
      whereConditions.push(
        eq(customerOrdersTable.fulfillmentWarehouseId, warehouseId)
      );
    }

    const orders = await db
      .select()
      .from(customerOrdersTable)
      .where(and(...whereConditions))
      .orderBy(customerOrdersTable.createdAt);

    return { data: orders, error: null };
  } catch (error) {
    console.error("Failed to get pending fulfillment orders:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get customer's order history
 */
export const get_customer_orders = async (
  userId: string,
  businessId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  if (!userId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;

    const [orders, totalCountResult] = await Promise.all([
      db
        .select()
        .from(customerOrdersTable)
        .where(
          and(
            eq(customerOrdersTable.userId, userId),
            eq(customerOrdersTable.businessId, businessId),
            eq(customerOrdersTable.isStoreOrder, true)
          )
        )
        .orderBy(desc(customerOrdersTable.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(customerOrdersTable)
        .where(
          and(
            eq(customerOrdersTable.userId, userId),
            eq(customerOrdersTable.businessId, businessId),
            eq(customerOrdersTable.isStoreOrder, true)
          )
        ),
    ]);

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      data: {
        orders,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get customer orders:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get order by tracking number
 */
export const get_order_by_tracking_number = async (
  trackingNumber: string,
  businessId: string
) => {
  if (!trackingNumber || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const order = await db.query.customerOrdersTable.findFirst({
      where: and(
        eq(customerOrdersTable.trackingNumber, trackingNumber),
        eq(customerOrdersTable.businessId, businessId),
        eq(customerOrdersTable.isStoreOrder, true)
      ),
    });

    if (!order) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: order, error: null };
  } catch (error) {
    console.error("Failed to get order by tracking number:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get recent orders for dashboard
 */
export const get_recent_store_orders = async (
  businessId: string,
  limit: number = 10
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const orders = await db
      .select()
      .from(customerOrdersTable)
      .where(
        and(
          eq(customerOrdersTable.businessId, businessId),
          eq(customerOrdersTable.isStoreOrder, true)
        )
      )
      .orderBy(desc(customerOrdersTable.createdAt))
      .limit(limit);

    return { data: orders, error: null };
  } catch (error) {
    console.error("Failed to get recent store orders:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
