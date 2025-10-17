"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import { auditLogsTable, userSettingsTable } from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertUserSetting,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = cache(async (userId: string) => {
  if (!userId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const settings = await db
      .select()
      .from(userSettingsTable)
      .where(eq(userSettingsTable.userId, userId));
    return { data: settings, error: null };
  } catch (error) {
    console.error("Failed to fetch user settings:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
});

export const get_all_cached = unstable_cache(
  async (userId: string) => {
    return get_all(userId);
  },
  ["user-settings"],
  {
    tags: ["user-settings"],
    revalidate: 300,
  },
);

export async function upsert(
  businessId: string,
  userId: string,
  setting: InsertUserSetting,
) {
  if (!setting.key) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [newSetting] = await tx
        .insert(userSettingsTable)
        .values(setting)
        .onConflictDoUpdate({
          target: [userSettingsTable.userId, userSettingsTable.key],
          set: { value: setting.value },
        })
        .returning();

      const auditData: InsertAuditLog = {
        businessId,
        model: "user-setting",
        recordId: newSetting.id,
        action: "upsert-user-setting",
        changes: JSON.stringify(setting),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return newSetting;
    });

    revalidatePath("/settings");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to upsert user setting:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
