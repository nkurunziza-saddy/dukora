"use server";

import { revalidateTag } from "next/cache";
import type { InsertAuditLog } from "@/lib/schema/schema.types";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as logsRepo from "@/server/repos/logs/logs-repo";

export const getLogs = createProtectedAction(
  PERMISSION.LOG_VIEW,
  async (user) => {
    const logs = await logsRepo.get_all(user.businessId ?? "", user.id);
    if (logs.error) {
      return { data: null, error: logs.error };
    }
    return { data: logs.data, error: null };
  }
);
export const getLogsPaginated = createProtectedAction(
  PERMISSION.LOG_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const logs = await logsRepo.get_all_paginated(
      user.businessId ?? "",
      user.id,
      page,
      pageSize
    );
    if (logs.error) {
      return { data: null, error: logs.error };
    }
    return { data: logs.data, error: null };
  }
);

export const getLogsOverview = createProtectedAction(
  PERMISSION.LOG_VIEW,
  async (user, limit?: number) => {
    const logs = await logsRepo.get_overview(
      user.businessId ?? "",
      user.id,
      limit
    );
    if (logs.error) {
      return { data: null, error: logs.error };
    }
    return { data: logs.data, error: null };
  }
);

export const getLogById = createProtectedAction(
  PERMISSION.LOG_VIEW,
  async (user, auditLogId: string) => {
    if (!auditLogId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const log = await logsRepo.get_by_id(auditLogId, user.businessId ?? "");
    if (log.error) {
      return { data: null, error: log.error };
    }
    return { data: log.data, error: null };
  }
);

export const createLog = createProtectedAction(
  PERMISSION.LOG_CREATE,
  async (user, logData: Omit<InsertAuditLog, "businessId" | "performedBy">) => {
    const log: InsertAuditLog = {
      ...logData,
      businessId: user.businessId ?? "",
      performedBy: user.id,
    };
    const res = await logsRepo.create(user.businessId ?? "", user.id, log);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`logs-${user.businessId}`, "max");
    revalidateTag("logs", "max");
    return { data: res.data, error: null };
  }
);

export const deleteLog = createProtectedAction(
  PERMISSION.LOG_DELETE,
  async (user, auditLogId: string) => {
    if (!auditLogId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const res = await logsRepo.remove(auditLogId, user.businessId ?? "");
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`logs-${user.businessId}`, "max");
    revalidateTag("logs", "max");
    return { data: res.data, error: null };
  }
);
