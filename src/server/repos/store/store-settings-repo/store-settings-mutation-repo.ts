"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogsTable, storeSettingsTable } from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertStoreSetting,
} from "@/lib/schema/schema.types";
import { ERROR_CODE } from "@/server/constants/errors";

/**
 * Initialize store settings for a business (first-time setup)
 */
export async function initialize_store_settings(
  businessId: string,
  userId: string,
  settings?: Partial<InsertStoreSetting>
) {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    // Check if settings already exist
    const existing = await db.query.storeSettingsTable.findFirst({
      where: eq(storeSettingsTable.businessId, businessId),
    });

    if (existing) {
      return { data: existing, error: null };
    }

    const result = await db.transaction(async (tx) => {
      // Create default settings
      const [newSettings] = await tx
        .insert(storeSettingsTable)
        .values({
          businessId,
          isStoreEnabled: settings?.isStoreEnabled || false,
          storeName: settings?.storeName,
          storeDescription: settings?.storeDescription,
          storeLogo: settings?.storeLogo,
          defaultWarehouseId: settings?.defaultWarehouseId,
          autoPublishNewProducts: settings?.autoPublishNewProducts || false,
          requireInventory: settings?.requireInventory ?? true,
          lowStockThreshold: settings?.lowStockThreshold || 10,
          syncMode: settings?.syncMode || "AUTO",
        })
        .returning();

      // Audit log
      const auditData: InsertAuditLog = {
        businessId,
        model: "store_settings",
        recordId: newSettings.id,
        action: "initialize-store-settings",
        changes: JSON.stringify(settings),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return newSettings;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to initialize store settings:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Update store settings
 */
export async function update_store_settings(
  businessId: string,
  userId: string,
  updates: Partial<InsertStoreSetting>
) {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(storeSettingsTable)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(storeSettingsTable.businessId, businessId))
        .returning();

      if (!updated) {
        // Settings don't exist yet, create them
        return null;
      }

      // Audit log
      const auditData: InsertAuditLog = {
        businessId,
        model: "store_settings",
        recordId: updated.id,
        action: "update-store-settings",
        changes: JSON.stringify(updates),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return updated;
    });

    if (!result) {
      // Initialize if not found
      return await initialize_store_settings(businessId, userId, updates);
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to update store settings:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Toggle store enabled/disabled
 */
export async function toggle_store_enabled(
  businessId: string,
  userId: string,
  enabled: boolean
) {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await update_store_settings(businessId, userId, {
      isStoreEnabled: enabled,
    });

    return result;
  } catch (error) {
    console.error("Failed to toggle store:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Update default warehouse for fulfillment
 */
export async function update_default_warehouse(
  businessId: string,
  userId: string,
  warehouseId: string | null
) {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await update_store_settings(businessId, userId, {
      defaultWarehouseId: warehouseId,
    });

    return result;
  } catch (error) {
    console.error("Failed to update default warehouse:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
