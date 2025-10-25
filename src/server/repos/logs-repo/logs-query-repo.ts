"use cache";

import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogsTable, usersTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = async (businessId: string, userId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const auditLogs = await db
      .select()
      .from(auditLogsTable)
      .where(
        and(
          eq(auditLogsTable.businessId, businessId),
          eq(auditLogsTable.performedBy, userId),
        ),
      )
      .orderBy(desc(auditLogsTable.performedAt));
    return { data: auditLogs, error: null };
  } catch (error) {
    console.error("Failed to fetch auditLogs:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_all_paginated = async (
  businessId: string,
  userId: string,
  page: number,
  pageSize: number,
) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;
    const auditLogs = await db
      .select()
      .from(auditLogsTable)
      .where(
        and(
          eq(auditLogsTable.businessId, businessId),
          eq(auditLogsTable.performedBy, userId),
        ),
      )
      .orderBy(desc(auditLogsTable.performedAt))
      .limit(pageSize)
      .offset(offset);
    const [totalCount] = await db
      .select({ count: count() })
      .from(auditLogsTable)
      .where(
        and(
          eq(auditLogsTable.businessId, businessId),
          eq(auditLogsTable.performedBy, userId),
        ),
      );
    return {
      data: { auditLogs, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch auditLogs:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_overview = async (
  businessId: string,
  userId: string,
  limit?: number,
) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const auditLogs = await db
      .select()
      .from(auditLogsTable)
      .where(
        and(
          eq(auditLogsTable.businessId, businessId),
          eq(auditLogsTable.performedBy, userId),
        ),
      )
      .innerJoin(usersTable, eq(auditLogsTable.performedBy, usersTable.id))
      .limit(limit ?? 5)
      .orderBy(desc(auditLogsTable.performedAt));
    return { data: auditLogs, error: null };
  } catch (error) {
    console.error("Failed to fetch auditLogs:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export async function get_by_id(auditLogId: string, businessId: string) {
  if (!auditLogId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const auditLog = await db.query.auditLogsTable.findFirst({
      where: and(
        eq(auditLogsTable.id, auditLogId),
        eq(auditLogsTable.businessId, businessId),
      ),
    });

    if (!auditLog) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND,
      };
    }

    return { data: auditLog, error: null };
  } catch (error) {
    console.error("Failed to fetch auditLog:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
