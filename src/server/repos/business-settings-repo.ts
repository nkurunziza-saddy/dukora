"use server";

import { eq, desc, and } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
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
      .where(eq(businessSettingsTable.businessId, businessId))
      .orderBy(desc(businessSettingsTable.createdAt));
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

export async function getById(settingId: string, businessId: string) {
  if (!settingId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const setting = await db.query.businessSettingsTable.findFirst({
      where: and(
        eq(businessSettingsTable.id, settingId),
        eq(businessSettingsTable.businessId, businessId)
      ),
    });

    if (!setting) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND ?? ErrorCode.FAILED_REQUEST,
      };
    }

    return { data: setting, error: null };
  } catch (error) {
    console.error("Failed to fetch business setting:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const getByIdCached = async (settingId: string, businessId: string) =>
  unstable_cache(
    async () => await getById(settingId, businessId),
    ["business-settings", settingId, businessId],
    {
      revalidate: 300,
      tags: [
        `business-settings-${businessId}`,
        `business-setting-${settingId}`,
      ],
    }
  );

export async function create(
  businessId: string,
  userId: string,
  setting: InsertBusinessSetting
) {
  if (!setting.key || !setting.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [newSetting] = await tx
        .insert(businessSettingsTable)
        .values(setting)
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "business-setting",
        recordId: newSetting.id,
        action: "create-business-setting",
        changes: JSON.stringify(setting),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return newSetting;
    });

    revalidateTag("business-settings");
    revalidateTag(`business-settings-${setting.businessId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create business setting:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  settingId: string,
  businessId: string,
  userId: string,
  updates: Partial<InsertBusinessSetting>
) {
  if (!settingId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [updatedSetting] = await tx
        .update(businessSettingsTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(
            eq(businessSettingsTable.id, settingId),
            eq(businessSettingsTable.businessId, businessId)
          )
        )
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "business-setting",
        recordId: updatedSetting.id,
        action: "update-business-setting",
        changes: JSON.stringify(updates),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return updatedSetting;
    });

    if (!result) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND ?? ErrorCode.FAILED_REQUEST,
      };
    }

    revalidateTag(`business-settings-${businessId}`);
    revalidateTag(`business-setting-${settingId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to update business setting:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(
  settingId: string,
  businessId: string,
  userId: string
) {
  if (!settingId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const existingRecord = await db.query.businessSettingsTable.findFirst({
      where: eq(businessSettingsTable.id, settingId),
    });
    if (!existingRecord) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }
    const result = await db.transaction(async (tx) => {
      const [deletedSetting] = await tx
        .delete(businessSettingsTable)
        .where(
          and(
            eq(businessSettingsTable.id, settingId),
            eq(businessSettingsTable.businessId, businessId)
          )
        )
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "business-setting",
        recordId: settingId,
        action: "delete-business-setting",
        changes: JSON.stringify(existingRecord),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return deletedSetting;
    });

    if (!result) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND ?? ErrorCode.FAILED_REQUEST,
      };
    }

    revalidateTag(`business-settings-${businessId}`);
    revalidateTag(`business-setting-${settingId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to delete business setting:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createMany(settings: InsertBusinessSetting[]) {
  if (settings === null) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  const businessId = settings[0]?.businessId;
  if (!businessId || !settings.every((s) => s.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .insert(businessSettingsTable)
      .values(settings)
      .returning();

    revalidateTag(`business-settings-${businessId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create business settings:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
