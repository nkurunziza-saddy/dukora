"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { storeMetricsTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

/**
 * Record a product view
 */
export async function record_product_view(
  businessId: string,
  storeProductId: string,
  date: Date = new Date()
) {
  if (!businessId || !storeProductId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const metricDate = new Date(date);
    metricDate.setHours(0, 0, 0, 0);

    // Upsert metric record for the day
    const result = await db
      .insert(storeMetricsTable)
      .values({
        businessId,
        storeProductId,
        metricDate,
        views: 1,
        addedToCart: 0,
        orders: 0,
        revenue: "0",
      })
      .onConflictDoUpdate({
        target: [
          storeMetricsTable.businessId,
          storeMetricsTable.storeProductId,
          storeMetricsTable.metricDate,
        ],
        set: {
          views: sql`${storeMetricsTable.views} + 1`,
        },
      })
      .returning();

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to record product view:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function record_add_to_cart(
  businessId: string,
  storeProductId: string,
  date: Date = new Date()
) {
  if (!businessId || !storeProductId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const metricDate = new Date(date);
    metricDate.setHours(0, 0, 0, 0);

    const result = await db
      .insert(storeMetricsTable)
      .values({
        businessId,
        storeProductId,
        metricDate,
        views: 0,
        addedToCart: 1,
        orders: 0,
        revenue: "0",
      })
      .onConflictDoUpdate({
        target: [
          storeMetricsTable.businessId,
          storeMetricsTable.storeProductId,
          storeMetricsTable.metricDate,
        ],
        set: {
          addedToCart: sql`${storeMetricsTable.addedToCart} + 1`,
        },
      })
      .returning();

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to record add to cart:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Record a purchase (order + revenue)
 */
export async function record_purchase(
  businessId: string,
  storeProductId: string | null, // null for store-level
  orderAmount: number,
  date: Date = new Date()
) {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const metricDate = new Date(date);
    metricDate.setHours(0, 0, 0, 0);

    const result = await db
      .insert(storeMetricsTable)
      .values({
        businessId,
        storeProductId,
        metricDate,
        views: 0,
        addedToCart: 0,
        orders: 1,
        revenue: orderAmount.toString(),
      })
      .onConflictDoUpdate({
        target: [
          storeMetricsTable.businessId,
          storeMetricsTable.storeProductId,
          storeMetricsTable.metricDate,
        ],
        set: {
          orders: sql`${storeMetricsTable.orders} + 1`,
          revenue: sql`${storeMetricsTable.revenue} + ${orderAmount}`,
        },
      })
      .returning();

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to record purchase:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Record store-level metrics (aggregated from products)
 */
export async function record_store_level_metrics(
  businessId: string,
  views: number,
  addedToCart: number,
  orders: number,
  revenue: number,
  date: Date = new Date()
) {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const metricDate = new Date(date);
    metricDate.setHours(0, 0, 0, 0);

    const result = await db
      .insert(storeMetricsTable)
      .values({
        businessId,
        storeProductId: null, // Store-level
        metricDate,
        views,
        addedToCart,
        orders,
        revenue: revenue.toString(),
      })
      .onConflictDoUpdate({
        target: [
          storeMetricsTable.businessId,
          storeMetricsTable.storeProductId,
          storeMetricsTable.metricDate,
        ],
        set: {
          views: sql`${storeMetricsTable.views} + ${views}`,
          addedToCart: sql`${storeMetricsTable.addedToCart} + ${addedToCart}`,
          orders: sql`${storeMetricsTable.orders} + ${orders}`,
          revenue: sql`${storeMetricsTable.revenue} + ${revenue}`,
        },
      })
      .returning();

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to record store level metrics:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Calculate and store daily aggregated metrics
 * (Can be run as a cron job)
 */
export async function calculate_daily_metrics(
  businessId: string,
  date: Date = new Date()
) {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const metricDate = new Date(date);
    metricDate.setHours(0, 0, 0, 0);

    // Aggregate product-level metrics for the day
    const [aggregated] = await db
      .select({
        totalViews: sql<number>`COALESCE(SUM(${storeMetricsTable.views}), 0)`,
        totalAddedToCart: sql<number>`COALESCE(SUM(${storeMetricsTable.addedToCart}), 0)`,
        totalOrders: sql<number>`COALESCE(SUM(${storeMetricsTable.orders}), 0)`,
        totalRevenue: sql<string>`COALESCE(SUM(${storeMetricsTable.revenue}), 0)`,
      })
      .from(storeMetricsTable)
      .where(
        and(
          eq(storeMetricsTable.businessId, businessId),
          eq(storeMetricsTable.metricDate, metricDate),
          sql`${storeMetricsTable.storeProductId} IS NOT NULL` // Product-level only
        )
      );

    if (!aggregated) {
      return { data: null, error: null };
    }

    // Update or create store-level metric
    const result = await db
      .insert(storeMetricsTable)
      .values({
        businessId,
        storeProductId: null,
        metricDate,
        views: aggregated.totalViews,
        addedToCart: aggregated.totalAddedToCart,
        orders: aggregated.totalOrders,
        revenue: aggregated.totalRevenue,
      })
      .onConflictDoUpdate({
        target: [
          storeMetricsTable.businessId,
          storeMetricsTable.storeProductId,
          storeMetricsTable.metricDate,
        ],
        set: {
          views: aggregated.totalViews,
          addedToCart: aggregated.totalAddedToCart,
          orders: aggregated.totalOrders,
          revenue: aggregated.totalRevenue,
        },
      })
      .returning();

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to calculate daily metrics:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
