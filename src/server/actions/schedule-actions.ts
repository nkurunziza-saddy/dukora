"use server";

import type { InsertSchedule } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import {
  get_all as getAllSchedulesRepo,
  get_overview as getOverviewSchedules,
  get_by_id as getScheduleByIdRepo,
  create as createScheduleRepo,
  update as updateScheduleRepo,
  remove as removeScheduleRepo,
  create_many as createManySchedulesRepo,
} from "../repos/schedules-repo";

export async function getSchedules() {
  const currentUser = await getUserIfHasPermission(Permission.SCHEDULE_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const schedules = await getAllSchedulesRepo(
      currentUser.businessId!,
      currentUser.id
    );
    if (schedules.error) {
      return { data: null, error: schedules.error };
    }
    return { data: schedules.data, error: null };
  } catch (error) {
    console.error("Error getting schedules:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getSchedulesOverview(limit?: number) {
  const currentUser = await getUserIfHasPermission(Permission.SCHEDULE_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const schedules = await getOverviewSchedules(
      currentUser.businessId!,
      currentUser.id,
      limit
    );
    if (schedules.error) {
      return { data: null, error: schedules.error };
    }
    return { data: schedules.data, error: null };
  } catch (error) {
    console.error("Error getting schedules:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getScheduleById(scheduleId: string) {
  const currentUser = await getUserIfHasPermission(Permission.SCHEDULE_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!scheduleId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const schedule = await getScheduleByIdRepo(
      scheduleId,
      currentUser.businessId!
    );

    if (schedule.error) {
      return { data: null, error: schedule.error };
    }

    return { data: schedule.data, error: null };
  } catch (error) {
    console.error("Error getting schedule:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createSchedule(
  scheduleData: Omit<InsertSchedule, "businessId" | "userId">
) {
  const currentUser = await getUserIfHasPermission(Permission.SCHEDULE_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!scheduleData.title?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const schedule: InsertSchedule = {
      ...scheduleData,
      businessId: currentUser.businessId!,
      userId: currentUser.id,
    };

    const res = await createScheduleRepo(
      currentUser.businessId!,
      currentUser.id,
      schedule
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`schedules-${currentUser.businessId!}`);

    return { data: res.data, error: null };
  } catch (error) {
    console.error("Error creating schedule:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function updateSchedule(
  scheduleId: string,
  updates: Partial<Omit<InsertSchedule, "userId" | "businessId">>
) {
  const currentUser = await getUserIfHasPermission(Permission.SCHEDULE_UPDATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!scheduleId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const updatedSchedule = await updateScheduleRepo(
      scheduleId,
      currentUser.businessId!,
      currentUser.id,
      updates
    );
    if (updatedSchedule.error) {
      return { data: null, error: updatedSchedule.error };
    }

    revalidateTag(`schedules-${currentUser.businessId!}`);
    revalidateTag(`schedule-${scheduleId}`);

    return { data: updatedSchedule.data, error: null };
  } catch (error) {
    console.error("Error updating schedule:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteSchedule(scheduleId: string) {
  const currentUser = await getUserIfHasPermission(Permission.SCHEDULE_DELETE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!scheduleId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    await removeScheduleRepo(scheduleId, currentUser.businessId!);

    revalidateTag(`schedules-${currentUser.businessId!}`);
    revalidateTag(`schedule-${scheduleId}`);

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createManySchedules(
  schedulesData: Omit<InsertSchedule, "businessId" | "id">[]
) {
  const currentUser = await getUserIfHasPermission(Permission.SCHEDULE_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!schedulesData?.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const schedules: InsertSchedule[] = schedulesData.map((schedule) => ({
      ...schedule,
      businessId: currentUser.businessId!,
      // id will be auto-generated by defaultRandom()
    }));

    const createdSchedules = await createManySchedulesRepo(schedules);

    revalidateTag(`schedules-${currentUser.businessId!}`);

    return { data: createdSchedules.data, error: null };
  } catch (error) {
    console.error("Error creating schedules:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
