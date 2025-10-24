"use server";

import { revalidatePath } from "next/cache";
import type { InsertSchedule } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as scheduleRepo from "../repos/schedules-repo";

export const getSchedules = createProtectedAction(
  Permission.SCHEDULE_VIEW,
  async (user) => {
    const schedules = await scheduleRepo.get_all_cached(
      user.businessId!,
      user.id
    );
    if (schedules.error) {
      return { data: null, error: schedules.error };
    }
    return { data: schedules.data, error: null };
  }
);

export const getSchedulesPaginated = createProtectedAction(
  Permission.SCHEDULE_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const schedules = await scheduleRepo.get_all_paginated_cached(
      user.businessId!,
      user.id,
      page,
      pageSize
    );
    if (schedules.error) {
      return { data: null, error: schedules.error };
    }
    return { data: schedules.data, error: null };
  }
);

export const getSchedulesOverview = createProtectedAction(
  Permission.SCHEDULE_VIEW,
  async (user, limit?: number) => {
    const schedules = await scheduleRepo.get_overview(
      user.businessId!,
      user.id,
      limit
    );
    if (schedules.error) {
      return { data: null, error: schedules.error };
    }
    return { data: schedules.data, error: null };
  }
);

export const getScheduleById = createProtectedAction(
  Permission.SCHEDULE_VIEW,
  async (user, scheduleId: string) => {
    if (!scheduleId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const schedule = await scheduleRepo.get_by_id(scheduleId, user.businessId!);
    if (schedule.error) {
      return { data: null, error: schedule.error };
    }
    return { data: schedule.data, error: null };
  }
);

export const createSchedule = createProtectedAction(
  Permission.SCHEDULE_CREATE,
  async (user, scheduleData: Omit<InsertSchedule, "businessId" | "userId">) => {
    if (!scheduleData.title?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const schedule: InsertSchedule = {
      ...scheduleData,
      businessId: user.businessId!,
      userId: user.id,
    };
    const res = await scheduleRepo.create(user.businessId!, user.id, schedule);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidatePath("/scheduler");
    revalidatePath("/dashboard");
    return { data: res.data, error: null };
  }
);

export const updateSchedule = createProtectedAction(
  Permission.SCHEDULE_UPDATE,
  async (
    user,
    {
      scheduleId,
      updates,
    }: {
      scheduleId: string;
      updates: Partial<Omit<InsertSchedule, "userId" | "businessId">>;
    }
  ) => {
    if (!scheduleId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedSchedule = await scheduleRepo.update(
      scheduleId,
      user.businessId!,
      user.id,
      updates
    );
    if (updatedSchedule.error) {
      return { data: null, error: updatedSchedule.error };
    }
    revalidatePath("/scheduler");
    revalidatePath("/dashboard");
    return { data: updatedSchedule.data, error: null };
  }
);

export const deleteSchedule = createProtectedAction(
  Permission.SCHEDULE_DELETE,
  async (user, scheduleId: string) => {
    if (!scheduleId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    await scheduleRepo.remove(scheduleId, user.businessId!);
    revalidatePath("/scheduler");
    revalidatePath("/dashboard");
    return { data: { success: true }, error: null };
  }
);

export const createManySchedules = createProtectedAction(
  Permission.SCHEDULE_CREATE,
  async (user, schedulesData: Omit<InsertSchedule, "businessId" | "id">[]) => {
    if (!schedulesData?.length) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const schedules: InsertSchedule[] = schedulesData.map((schedule) => ({
      ...schedule,
      businessId: user.businessId!,
    }));
    const createdSchedules = await scheduleRepo.create_many(schedules);
    revalidatePath("/scheduler");
    revalidatePath("/dashboard");
    return { data: createdSchedules, error: null };
  }
);
