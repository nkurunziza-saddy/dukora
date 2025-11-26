"use cache";

import { count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notificationsTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;

    const [notifications, totalCountResult] = await Promise.all([
      db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.businessId, businessId))
        .orderBy(desc(notificationsTable.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(notificationsTable)
        .where(eq(notificationsTable.businessId, businessId)),
    ]);

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      data: {
        notifications,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get paginated notifications:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
