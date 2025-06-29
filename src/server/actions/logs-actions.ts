"use server";

import type { InsertAuditLog } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import {
  get_all as getAllLogsRepo,
  get_overview as getOverviewLogsRepo,
  get_by_id as getLogByIdRepo,
  create as createLogRepo,
  remove as removeLogRepo,
} from "../repos/logs-repo";

export async function getLogs() {
  const currentUser = await getUserIfHasPermission(Permission.LOG_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const logs = await getAllLogsRepo(currentUser.businessId!, currentUser.id);
    if (logs.error) {
      return { data: null, error: logs.error };
    }
    return { data: logs.data, error: null };
  } catch (error) {
    console.error("Error getting logs:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getLogsOverview(limit?: number) {
  const currentUser = await getUserIfHasPermission(Permission.LOG_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const logs = await getOverviewLogsRepo(
      currentUser.businessId!,
      currentUser.id,
      limit
    );
    if (logs.error) {
      return { data: null, error: logs.error };
    }
    return { data: logs.data, error: null };
  } catch (error) {
    console.error("Error getting logs overview:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getLogById(auditLogId: string) {
  const currentUser = await getUserIfHasPermission(Permission.LOG_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!auditLogId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const log = await getLogByIdRepo(auditLogId, currentUser.businessId!);
    if (log.error) {
      return { data: null, error: log.error };
    }
    return { data: log.data, error: null };
  } catch (error) {
    console.error("Error getting log by id:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createLog(
  logData: Omit<InsertAuditLog, "businessId" | "performedBy">
) {
  const currentUser = await getUserIfHasPermission(Permission.LOG_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  // You may want to validate logData fields here if necessary

  try {
    const log: InsertAuditLog = {
      ...logData,
      businessId: currentUser.businessId!,
      performedBy: currentUser.id,
    };

    const res = await createLogRepo(
      currentUser.businessId!,
      currentUser.id,
      log
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`auditLogs-${currentUser.businessId!}`);

    return { data: res.data, error: null };
  } catch (error) {
    console.error("Error creating log:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteLog(auditLogId: string) {
  const currentUser = await getUserIfHasPermission(Permission.LOG_DELETE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!auditLogId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const res = await removeLogRepo(auditLogId, currentUser.businessId!);

    revalidateTag(`auditLogs-${currentUser.businessId!}`);
    revalidateTag(`auditLog-${auditLogId}`);

    if (res.error) {
      return { data: null, error: res.error };
    }

    return { data: res.data, error: null };
  } catch (error) {
    console.error("Error deleting log:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
