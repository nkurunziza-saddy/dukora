"use cache";

import { and, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notificationsTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

export const get_notification_stats = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const [totalResult, unreadResult, highPriorityResult] = await Promise.all([
      db
        .select({ count: count() })
        .from(notificationsTable)
        .where(eq(notificationsTable.businessId, businessId)),
      db
        .select({ count: count() })
        .from(notificationsTable)
        .where(
          and(
            eq(notificationsTable.businessId, businessId),
            eq(notificationsTable.read, false),
          ),
        ),
      db
        .select({ count: count() })
        .from(notificationsTable)
        .where(
          and(
            eq(notificationsTable.businessId, businessId),
            eq(notificationsTable.read, false),
            eq(notificationsTable.priority, "high"),
          ),
        ),
    ]);

    return {
      data: {
        total: totalResult[0]?.count || 0,
        unread: unreadResult[0]?.count || 0,
        highPriority: highPriorityResult[0]?.count || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get notification stats:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
