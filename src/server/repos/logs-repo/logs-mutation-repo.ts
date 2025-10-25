"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogsTable } from "@/lib/schema";
import type { InsertAuditLog } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function create(
  _businessId: string,
  _userId: string,
  auditLog: InsertAuditLog,
) {
  try {
    const [newAuditLog] = await db
      .insert(auditLogsTable)
      .values(auditLog)
      .returning();

    return { data: newAuditLog, error: null };
  } catch (error) {
    console.error("Failed to create auditLog:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(auditLogId: string, businessId: string) {
  if (!auditLogId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const existingRecord = await db.query.auditLogsTable.findFirst({
      where: eq(auditLogsTable.id, auditLogId),
    });
    if (!existingRecord) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }
    const [deletedAuditLog] = await db
      .delete(auditLogsTable)
      .where(
        and(
          eq(auditLogsTable.id, auditLogId),
          eq(auditLogsTable.businessId, businessId),
        ),
      )
      .returning();

    if (!deletedAuditLog) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND,
      };
    }

    return { data: deletedAuditLog, error: null };
  } catch (error) {
    console.error("Failed to delete auditLog:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
