"use cache";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { storeSettingsTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

/**
 * Get store settings for a business
 */
export const get_store_settings = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const settings = await db.query.storeSettingsTable.findFirst({
      where: eq(storeSettingsTable.businessId, businessId),
      with: {
        defaultWarehouse: true,
      },
    });

    return { data: settings, error: null };
  } catch (error) {
    console.error("Failed to fetch store settings:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Check if store is enabled for a business
 */
export const is_store_enabled = async (businessId: string) => {
  if (!businessId) {
    return { data: false, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const settings = await db.query.storeSettingsTable.findFirst({
      where: eq(storeSettingsTable.businessId, businessId),
      columns: {
        isStoreEnabled: true,
      },
    });

    return { data: settings?.isStoreEnabled || false, error: null };
  } catch (error) {
    console.error("Failed to check store status:", error);
    return { data: false, error: ERROR_CODE.FAILED_REQUEST };
  }
};
