"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import { schedulesTable } from "@/lib/schema/models/schedules";
import type { InsertSchedule } from "@/lib/schema/schema-types";
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

export const get_all_cached = unstable_cache(
  async (businessId: string, userId: string) => {
    return get_all(businessId, userId);
  },
  ["suppliers"],
  {
    revalidate: 300,
    tags: ["suppliers"],
  },
);

export const get_overview = cache(
  async (businessId: string, userId: string, limit?: number) => {
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
  },
);

export const get_by_id = cache(
  async (scheduleId: string, businessId: string) => {
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
  },
);

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

    revalidatePath("/scheduler");
    revalidatePath("/dashboard");

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

    revalidatePath("/scheduler");
    revalidatePath("/dashboard");

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

    revalidatePath("/scheduler");
    revalidatePath("/dashboard");

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

    revalidatePath("/scheduler");
    revalidatePath("/dashboard");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create schedules:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
