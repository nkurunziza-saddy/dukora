"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessesTable, metricsTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export async function get_metric(
  businessId: string,
  periodType: string,
  period: Date,
) {
  try {
    const result = await db
      .select()
      .from(metricsTable)
      .where(
        and(
          eq(metricsTable.businessId, businessId),
          eq(metricsTable.periodType, periodType),
          eq(metricsTable.period, period),
        ),
      )
      .limit(1);
    return { data: result[0] || null, error: null };
  } catch (error) {
    console.error("Failed to get metric:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function get_metric_by_name(
  businessId: string,
  name: string,
  periodType: string,
  period: Date,
) {
  try {
    const currentBusiness = await db.query.businessesTable.findFirst({
      where: eq(businessesTable.id, businessId),
    });

    if (!currentBusiness) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const result = await db
      .select()
      .from(metricsTable)
      .where(
        and(
          eq(metricsTable.businessId, businessId),
          eq(metricsTable.name, name),
          eq(metricsTable.periodType, periodType),
          eq(metricsTable.period, period),
        ),
      )
      .limit(1);

    if (!result || result.length <= 0) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: result[0] || null, error: null };
  } catch (error) {
    console.error("Failed to get metric:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function get_monthly_metrics(businessId: string, date: Date) {
  try {
    const result = await db
      .select()
      .from(metricsTable)
      .where(
        and(
          eq(metricsTable.businessId, businessId),
          eq(metricsTable.periodType, "monthly"),
          eq(metricsTable.period, date),
        ),
      );

    const metricsObject = result.reduce(
      (acc, metric) => {
        acc[metric.name] = Number(metric.value);
        return acc;
      },
      {} as Record<string, number>,
    );

    return { data: metricsObject, error: null };
  } catch (error) {
    console.error("Failed to get monthly metrics:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function get_metrics_history(
  businessId: string,
  metricNames: string[],
  periodType = "monthly",
  limit = 12,
) {
  try {
    const result = await db
      .select()
      .from(metricsTable)
      .where(
        and(
          eq(metricsTable.businessId, businessId),
          eq(metricsTable.periodType, periodType),
        ),
      )
      .orderBy(desc(metricsTable.period))
      .limit(limit * metricNames.length);

    const groupedMetrics = result.reduce(
      (acc, metric) => {
        const period = metric.period.toISOString().slice(0, 7);
        if (!acc[period]) acc[period] = {};
        acc[period][metric.name] = Number(metric.value);
        return acc;
      },
      {} as Record<string, Record<string, number>>,
    );

    return { data: groupedMetrics, error: null };
  } catch (error) {
    console.error("Failed to get metrics history:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function get_latest_metrics(
  businessId: string,
  metricNames: string[],
) {
  try {
    const result = await db
      .select()
      .from(metricsTable)
      .where(eq(metricsTable.businessId, businessId))
      .orderBy(desc(metricsTable.period))
      .limit(50);

    const latestMetrics = metricNames.reduce(
      (acc, metricName) => {
        const metric = result.find((m) => m.name === metricName);
        if (metric) {
          acc[metricName] = Number(metric.value);
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return { data: latestMetrics, error: null };
  } catch (error) {
    console.error("Failed to get latest metrics:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}
