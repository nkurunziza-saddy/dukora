"use cache";

import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.businessId, businessId),
          isNull(usersTable.deletedAt),
        ),
      );
    return { data: users, error: null };
  } catch (error) {
    console.error("Failed to get users:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;
    const users = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.businessId, businessId),
          isNull(usersTable.deletedAt),
        ),
      )
      .orderBy(usersTable.role)
      .limit(pageSize)
      .offset(offset);
    const [totalCount] = await db
      .select({ count: count() })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.businessId, businessId),
          isNull(usersTable.deletedAt),
        ),
      );
    return {
      data: { users, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get users:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_by_id = async (userId: string, businessId: string) => {
  if (!userId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const user = await db.query.usersTable.findFirst({
      where: and(
        eq(usersTable.id, userId),
        eq(usersTable.businessId, businessId),
        isNull(usersTable.deletedAt),
      ),
      with: {
        business: true,
        schedules: true,
        auditLogs: true,
        expenses: true,
        transactions: true,
      },
    });

    if (!user) {
      return { data: null, error: ErrorCode.USER_NOT_FOUND };
    }

    return { data: user, error: null };
  } catch (error) {
    console.error("Failed to get user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
