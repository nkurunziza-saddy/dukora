"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { metricsTable } from "@/lib/schema";
import type { InsertMetric } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function insert_metric(
  metric: Omit<InsertMetric, "id" | "createdAt">,
) {
  try {
    const existingRecord = await db.query.metricsTable.findFirst({
      where: and(
        eq(metricsTable.businessId, metric.businessId),
        eq(metricsTable.name, metric.name),
        eq(metricsTable.period, metric.period),
        eq(metricsTable.periodType, metric.periodType || "monthly"),
      ),
    });
    if (existingRecord) {
      return { data: null, error: ErrorCode.ALREADY_EXISTS };
    }
    const result = await db.insert(metricsTable).values(metric).returning();
    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to insert metric:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function upsert_metric(
  metric: Omit<InsertMetric, "id" | "createdAt">,
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

export async function delete_metrics_for_period(
  businessId: string,
  periodType: string,
  period: Date,
) {
  try {
    const result = await db
      .delete(metricsTable)
      .where(
        and(
          eq(metricsTable.businessId, businessId),
          eq(metricsTable.periodType, periodType),
          eq(metricsTable.period, period),
        ),
      );
    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to delete metrics:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}

export async function bulk_insert_metrics(
  metrics: Omit<InsertMetric, "id" | "createdAt">[],
) {
  try {
    const result = await db.insert(metricsTable).values(metrics).returning();
    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to bulk insert metrics:", error);
    return { data: null, error: ErrorCode.DATABASE_ERROR };
  }
}
