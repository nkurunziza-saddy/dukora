"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import { auditLogsTable, usersTable } from "@/lib/schema";
import type { InsertAuditLog } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = cache(async (businessId: string, userId: string) => {
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
});

export const get_all_cached = unstable_cache(
  async (businessId: string, userId: string) => {
    return get_all(businessId, userId);
  },
  ["logs"],
  {
    tags: ["logs"],
    revalidate: 300,
  },
);

export const get_overview = cache(
  async (businessId: string, userId: string, limit?: number) => {
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
  },
);

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

    revalidatePath("/", "layout");

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

    revalidatePath("/", "layout");

    return { data: deletedAuditLog, error: null };
  } catch (error) {
    console.error("Failed to delete auditLog:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
