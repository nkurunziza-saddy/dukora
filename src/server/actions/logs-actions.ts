"use server";

import type { InsertAuditLog } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { createProtectedAction } from "@/server/helpers/action-factory";
import {
  get_all_cached as getAllLogsRepo,
  get_overview as getOverviewLogsRepo,
  get_by_id as getLogByIdRepo,
  create as createLogRepo,
  remove as removeLogRepo,
} from "../repos/logs-repo";

export const getLogs = createProtectedAction(
  Permission.LOG_VIEW,
  async (user) => {
    const logs = await getAllLogsRepo(user.businessId!, user.id);
    if (logs.error) {
      return { data: null, error: logs.error };
    }
    return { data: logs.data, error: null };
  }
);

export const getLogsOverview = createProtectedAction(
  Permission.LOG_VIEW,
  async (user, limit?: number) => {
    const logs = await getOverviewLogsRepo(user.businessId!, user.id, limit);
    if (logs.error) {
      return { data: null, error: logs.error };
    }
    return { data: logs.data, error: null };
  }
);

export const getLogById = createProtectedAction(
  Permission.LOG_VIEW,
  async (user, auditLogId: string) => {
    if (!auditLogId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const log = await getLogByIdRepo(auditLogId, user.businessId!);
    if (log.error) {
      return { data: null, error: log.error };
    }
    return { data: log.data, error: null };
  }
);

export const createLog = createProtectedAction(
  Permission.LOG_CREATE,
  async (user, logData: Omit<InsertAuditLog, "businessId" | "performedBy">) => {
    const log: InsertAuditLog = {
      ...logData,
      businessId: user.businessId!,
      performedBy: user.id,
    };
    const res = await createLogRepo(user.businessId!, user.id, log);
    if (res.error) {
      return { data: null, error: res.error };
    }
    return { data: res.data, error: null };
  }
);

export const deleteLog = createProtectedAction(
  Permission.LOG_DELETE,
  async (user, auditLogId: string) => {
    if (!auditLogId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const res = await removeLogRepo(auditLogId, user.businessId!);
    if (res.error) {
      return { data: null, error: res.error };
    }
    return { data: res.data, error: null };
  }
);
