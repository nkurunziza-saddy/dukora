"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { schedulesTable } from "@/lib/schema/models/schedules";
import type { InsertSchedule } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function create(
  _businessId: string,
  _userId: string,
  schedule: InsertSchedule,
) {
  if (!schedule.title || !schedule.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const [newSchedule] = await db
      .insert(schedulesTable)
      .values(schedule)
      .returning();

    return { data: newSchedule, error: null };
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  scheduleId: string,
  businessId: string,
  _userId: string,
  updates: Partial<InsertSchedule>,
) {
  if (!scheduleId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const [updatedSchedule] = await db
      .update(schedulesTable)
      .set({ ...updates, updated_at: new Date() })
      .where(
        and(
          eq(schedulesTable.id, scheduleId),
          eq(schedulesTable.businessId, businessId),
        ),
      )
      .returning();

    if (!updatedSchedule) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND,
      };
    }

    return { data: updatedSchedule, error: null };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(scheduleId: string, businessId: string) {
  if (!scheduleId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const existingRecord = await db.query.schedulesTable.findFirst({
      where: eq(schedulesTable.id, scheduleId),
    });
    if (!existingRecord) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }
    const [deletedSchedule] = await db
      .delete(schedulesTable)
      .where(
        and(
          eq(schedulesTable.id, scheduleId),
          eq(schedulesTable.businessId, businessId),
        ),
      )
      .returning();

    if (!deletedSchedule) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND,
      };
    }

    return { data: deletedSchedule, error: null };
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create_many(schedules: InsertSchedule[]) {
  if (!schedules.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  const businessId = schedules[0]?.businessId;
  if (!businessId || !schedules.every((p) => p.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .insert(schedulesTable)
      .values(schedules)
      .returning();

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create schedules:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
