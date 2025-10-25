"use cache";

import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { schedulesTable } from "@/lib/schema/models/schedules";
import { ErrorCode } from "@/server/constants/errors";

export async function get_all(businessId: string, userId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const schedules = await db
      .select()
      .from(schedulesTable)
      .where(
        and(
          eq(schedulesTable.businessId, businessId),
          eq(schedulesTable.userId, userId),
        ),
      )
      .orderBy(desc(schedulesTable.created_at));
    return { data: schedules, error: null };
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_all_paginated(
  businessId: string,
  userId: string,
  page: number,
  pageSize: number,
) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;
    const schedules = await db
      .select()
      .from(schedulesTable)
      .where(
        and(
          eq(schedulesTable.businessId, businessId),
          eq(schedulesTable.userId, userId),
        ),
      )
      .orderBy(desc(schedulesTable.created_at))
      .limit(pageSize)
      .offset(offset);
    const [totalCount] = await db
      .select({ count: count() })
      .from(schedulesTable)
      .where(
        and(
          eq(schedulesTable.businessId, businessId),
          eq(schedulesTable.userId, userId),
        ),
      );
    return {
      data: { schedules, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const get_overview = async (
  businessId: string,
  userId: string,
  limit?: number,
) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const schedules = await db
      .select()
      .from(schedulesTable)
      .where(
        and(
          eq(schedulesTable.businessId, businessId),
          eq(schedulesTable.userId, userId),
        ),
      )
      .orderBy(desc(schedulesTable.created_at))
      .limit(limit ?? 5);
    return { data: schedules, error: null };
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_by_id = async (scheduleId: string, businessId: string) => {
  if (!scheduleId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const schedule = await db.query.schedulesTable.findFirst({
      where: and(
        eq(schedulesTable.id, scheduleId),
        eq(schedulesTable.businessId, businessId),
      ),
    });

    if (!schedule) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND,
      };
    }

    return { data: schedule, error: null };
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
