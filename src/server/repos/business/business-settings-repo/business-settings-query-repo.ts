"use cache";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessSettingsTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const settings = await db
      .select()
      .from(businessSettingsTable)
      .where(eq(businessSettingsTable.businessId, businessId));
    return { data: settings, error: null };
  } catch (error) {
    console.error("Failed to fetch business settings:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
