"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { revalidatePath, unstable_cache } from "next/cache";
import { auditLogsTable, businessSettingsTable } from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertBusinessSetting,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function getAll(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const settings = await db
      .select()
      .from(businessSettingsTable)
      .where(eq(businessSettingsTable.businessId, businessId));
    return { data: settings, error: null };
  } catch (error) {
    console.error("Failed to fetch business settings:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const getAllCached = async (businessId: string) =>
  unstable_cache(
    async () => await getAll(businessId),
    ["business-settings", businessId],
    {
      revalidate: 300,
      tags: [`business-settings-${businessId}`],
    }
  );

export async function upsert(
  businessId: string,
  userId: string,
  setting: InsertBusinessSetting
) {
  if (!setting.key) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [newSetting] = await tx
        .insert(businessSettingsTable)
        .values(setting)
        .onConflictDoUpdate({
          target: [businessSettingsTable.businessId, businessSettingsTable.key],
          set: { value: setting.value },
        })
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "business-setting",
        recordId: newSetting.id,
        action: "upsert-business-setting",
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
    console.error("Failed to upsert business setting:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function upsertMany(
  userId: string,
  settings: InsertBusinessSetting[]
) {
  if (!Array.isArray(settings) || settings.length === 0) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const upsertedSettings = [];

      for (const setting of settings) {
        if (!setting.key) continue;

        const [newSetting] = await tx
          .insert(businessSettingsTable)
          .values(setting)
          .onConflictDoUpdate({
            target: [
              businessSettingsTable.businessId,
              businessSettingsTable.key,
            ],
            set: { value: setting.value },
          })
          .returning();

        const auditData: InsertAuditLog = {
          businessId: newSetting.businessId,
          model: "business-setting",
          recordId: newSetting.id,
          action: "upsert-business-setting",
          changes: JSON.stringify(setting),
          performedBy: userId,
          performedAt: new Date(),
        };

        await tx.insert(auditLogsTable).values(auditData);
        upsertedSettings.push(newSetting);
      }

      return upsertedSettings;
    });

    revalidatePath("/settings");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to upsert many business settings:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
