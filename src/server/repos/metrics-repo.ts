"use server";

import { db } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import type { InsertMetric } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { businessesTable, metricsTable } from "@/lib/schema";

export async function InsertMetric(
  metric: Omit<InsertMetric, "id" | "createdAt">
) {
  try {
    const existingRecord = await db.query.metricsTable.findFirst({
      where: and(
        eq(metricsTable.period, metric.period),
        eq(metricsTable.periodType, metric.periodType || "monthly")
      ),
    });
    if (existingRecord) {
      return { data: null, error: ErrorCode.ALREADY_EXISTS };
    }
    const result = await db.insert(metricsTable).values(metric).returning();

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to upsert metric:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function upsertMetric(
  metric: Omit<InsertMetric, "id" | "createdAt">
) {
  try {
    const result = await db
      .insert(metricsTable)
      .values(metric)
      .onConflictDoUpdate({
        target: [
          metricsTable.businessId,
          metricsTable.name,
          metricsTable.periodType,
          metricsTable.period,
        ],
        set: {
          value: metric.value,
          createdAt: new Date(),
        },
      })
      .returning();

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to upsert metric:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function getMetric(
  businessId: string,
  periodType: string,
  period: Date
) {
  try {
    const result = await db
      .select()
      .from(metricsTable)
      .where(
        and(
          eq(metricsTable.businessId, businessId),
          eq(metricsTable.periodType, periodType),
          eq(metricsTable.period, period)
        )
      )
      .limit(1);

    return { data: result[0] || null, error: null };
  } catch (error) {
    console.error("Failed to get metric:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function getMetricByName(
  businessId: string,
  name: string,
  periodType: string,
  period: Date
) {
  try {
    const currentBusiness = await db.query.businessesTable.findFirst({
      where: eq(businessesTable.id, businessId),
    });

    if (!currentBusiness) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }
    // if (period < currentBusiness.createdAt) {
    //   return { data: null, error: ErrorCode.BAD_REQUEST };
    // }

    const result = await db
      .select()
      .from(metricsTable)
      .where(
        and(
          eq(metricsTable.businessId, businessId),
          eq(metricsTable.name, name),
          eq(metricsTable.periodType, periodType),
          eq(metricsTable.period, period)
        )
      )
      .limit(1);

    return { data: result[0] || null, error: null };
  } catch (error) {
    console.error("Failed to get metric:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function getMonthlyMetrics(businessId: string, date: Date) {
  try {
    const result = await db
      .select()
      .from(metricsTable)
      .where(
        and(
          eq(metricsTable.businessId, businessId),
          eq(metricsTable.periodType, "monthly"),
          eq(metricsTable.period, date)
        )
      );

    const metricsObject = result.reduce((acc, metric) => {
      acc[metric.name] = Number(metric.value);
      return acc;
    }, {} as Record<string, number>);

    return { data: metricsObject, error: null };
  } catch (error) {
    console.error("Failed to get monthly metrics:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function getMetricsHistory(
  businessId: string,
  metricNames: string[],
  periodType = "monthly",
  limit = 12
) {
  try {
    const result = await db
      .select()
      .from(metricsTable)
      .where(
        and(
          eq(metricsTable.businessId, businessId),
          eq(metricsTable.periodType, periodType)
        )
      )
      .orderBy(desc(metricsTable.period))
      .limit(limit * metricNames.length);

    const groupedMetrics = result.reduce((acc, metric) => {
      const period = metric.period.toISOString().slice(0, 7);
      if (!acc[period]) acc[period] = {};
      acc[period][metric.name] = Number(metric.value);
      return acc;
    }, {} as Record<string, Record<string, number>>);

    return { data: groupedMetrics, error: null };
  } catch (error) {
    console.error("Failed to get metrics history:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function deleteMetricsForPeriod(
  businessId: string,
  periodType: string,
  period: Date
) {
  try {
    const result = await db
      .delete(metricsTable)
      .where(
        and(
          eq(metricsTable.businessId, businessId),
          eq(metricsTable.periodType, periodType),
          eq(metricsTable.period, period)
        )
      );

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to delete metrics:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function getLatestMetrics(
  businessId: string,
  metricNames: string[]
) {
  try {
    const result = await db
      .select()
      .from(metricsTable)
      .where(eq(metricsTable.businessId, businessId))
      .orderBy(desc(metricsTable.period))
      .limit(50);

    const latestMetrics = metricNames.reduce((acc, metricName) => {
      const metric = result.find((m) => m.name === metricName);
      if (metric) {
        acc[metricName] = Number(metric.value);
      }
      return acc;
    }, {} as Record<string, number>);

    return { data: latestMetrics, error: null };
  } catch (error) {
    console.error("Failed to get latest metrics:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function bulkInsertMetrics(
  metrics: Omit<InsertMetric, "id" | "createdAt">[]
) {
  try {
    const result = await db.insert(metricsTable).values(metrics).returning();

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to bulk insert metrics:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}
