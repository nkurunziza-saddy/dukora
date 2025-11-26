"use cache";

import { and, between, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { storeMetricsTable, storeProductsTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

/**
 * Get store-level performance metrics for a date range
 */
export const get_store_performance_metrics = async (
  businessId: string,
  startDate: Date,
  endDate: Date
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const metrics = await db
      .select({
        metricDate: storeMetricsTable.metricDate,
        views: sql<number>`SUM(${storeMetricsTable.views})`,
        addedToCart: sql<number>`SUM(${storeMetricsTable.addedToCart})`,
        orders: sql<number>`SUM(${storeMetricsTable.orders})`,
        revenue: sql<string>`SUM(${storeMetricsTable.revenue})`,
      })
      .from(storeMetricsTable)
      .where(
        and(
          eq(storeMetricsTable.businessId, businessId),
          sql`${storeMetricsTable.storeProductId} IS NULL`, // Store-level only
          between(storeMetricsTable.metricDate, startDate, endDate)
        )
      )
      .groupBy(storeMetricsTable.metricDate)
      .orderBy(storeMetricsTable.metricDate);

    // Calculate totals and conversion rate
    const totals = metrics.reduce(
      (acc, m) => ({
        totalViews: acc.totalViews + Number(m.views),
        totalAddedToCart: acc.totalAddedToCart + Number(m.addedToCart),
        totalOrders: acc.totalOrders + Number(m.orders),
        totalRevenue: acc.totalRevenue + Number(m.revenue),
      }),
      { totalViews: 0, totalAddedToCart: 0, totalOrders: 0, totalRevenue: 0 }
    );

    const conversionRate =
      totals.totalViews > 0
        ? (totals.totalOrders / totals.totalViews) * 100
        : 0;

    const avgOrderValue =
      totals.totalOrders > 0 ? totals.totalRevenue / totals.totalOrders : 0;

    return {
      data: {
        metrics,
        totals,
        conversionRate: conversionRate.toFixed(2),
        avgOrderValue: avgOrderValue.toFixed(2),
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch store performance metrics:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get product-specific performance metrics
 */
export const get_product_performance_metrics = async (
  storeProductId: string,
  startDate: Date,
  endDate: Date
) => {
  if (!storeProductId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const metrics = await db
      .select()
      .from(storeMetricsTable)
      .where(
        and(
          eq(storeMetricsTable.storeProductId, storeProductId),
          between(storeMetricsTable.metricDate, startDate, endDate)
        )
      )
      .orderBy(storeMetricsTable.metricDate);

    // Calculate totals
    const totals = metrics.reduce(
      (acc, m) => ({
        totalViews: acc.totalViews + m.views,
        totalAddedToCart: acc.totalAddedToCart + m.addedToCart,
        totalOrders: acc.totalOrders + m.orders,
        totalRevenue: acc.totalRevenue + Number(m.revenue),
      }),
      { totalViews: 0, totalAddedToCart: 0, totalOrders: 0, totalRevenue: 0 }
    );

    const conversionRate =
      totals.totalViews > 0
        ? (totals.totalOrders / totals.totalViews) * 100
        : 0;

    return {
      data: {
        metrics,
        totals,
        conversionRate: conversionRate.toFixed(2),
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch product performance metrics:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get top performing products
 */
export const get_top_performing_products = async (
  businessId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 10,
  sortBy: "revenue" | "orders" | "views" = "revenue"
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const sortColumn =
      sortBy === "revenue"
        ? sql<string>`SUM(${storeMetricsTable.revenue})`
        : sortBy === "orders"
          ? sql<number>`SUM(${storeMetricsTable.orders})`
          : sql<number>`SUM(${storeMetricsTable.views})`;

    const topProducts = await db
      .select({
        storeProductId: storeMetricsTable.storeProductId,
        storeTitle: storeProductsTable.storeTitle,
        totalViews: sql<number>`SUM(${storeMetricsTable.views})`,
        totalAddedToCart: sql<number>`SUM(${storeMetricsTable.addedToCart})`,
        totalOrders: sql<number>`SUM(${storeMetricsTable.orders})`,
        totalRevenue: sql<string>`SUM(${storeMetricsTable.revenue})`,
      })
      .from(storeMetricsTable)
      .innerJoin(
        storeProductsTable,
        eq(storeMetricsTable.storeProductId, storeProductsTable.id)
      )
      .where(
        and(
          eq(storeMetricsTable.businessId, businessId),
          sql`${storeMetricsTable.storeProductId} IS NOT NULL`,
          between(storeMetricsTable.metricDate, startDate, endDate)
        )
      )
      .groupBy(storeMetricsTable.storeProductId, storeProductsTable.storeTitle)
      .orderBy(desc(sortColumn))
      .limit(limit);

    return { data: topProducts, error: null };
  } catch (error) {
    console.error("Failed to fetch top performing products:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get revenue trends (aggregated by day/week/month)
 */
export const get_revenue_trends = async (
  businessId: string,
  startDate: Date,
  endDate: Date,
  groupBy: "day" | "week" | "month" = "day"
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    let dateFormat: any;
    switch (groupBy) {
      case "week":
        dateFormat = sql`DATE_TRUNC('week', ${storeMetricsTable.metricDate})`;
        break;
      case "month":
        dateFormat = sql`DATE_TRUNC('month', ${storeMetricsTable.metricDate})`;
        break;
      default:
        dateFormat = storeMetricsTable.metricDate;
    }

    const trends = await db
      .select({
        period: dateFormat,
        totalRevenue: sql<string>`SUM(${storeMetricsTable.revenue})`,
        totalOrders: sql<number>`SUM(${storeMetricsTable.orders})`,
        totalViews: sql<number>`SUM(${storeMetricsTable.views})`,
      })
      .from(storeMetricsTable)
      .where(
        and(
          eq(storeMetricsTable.businessId, businessId),
          sql`${storeMetricsTable.storeProductId} IS NULL`, // Store-level
          between(storeMetricsTable.metricDate, startDate, endDate)
        )
      )
      .groupBy(dateFormat)
      .orderBy(dateFormat);

    return { data: trends, error: null };
  } catch (error) {
    console.error("Failed to fetch revenue trends:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get today's metrics for dashboard
 */
export const get_todays_metrics = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [metrics] = await db
      .select({
        views: sql<number>`COALESCE(SUM(${storeMetricsTable.views}), 0)`,
        addedToCart: sql<number>`COALESCE(SUM(${storeMetricsTable.addedToCart}), 0)`,
        orders: sql<number>`COALESCE(SUM(${storeMetricsTable.orders}), 0)`,
        revenue: sql<string>`COALESCE(SUM(${storeMetricsTable.revenue}), 0)`,
      })
      .from(storeMetricsTable)
      .where(
        and(
          eq(storeMetricsTable.businessId, businessId),
          sql`${storeMetricsTable.storeProductId} IS NULL`,
          gte(storeMetricsTable.metricDate, today)
        )
      );

    return {
      data: metrics || { views: 0, addedToCart: 0, orders: 0, revenue: "0" },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch today's metrics:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
