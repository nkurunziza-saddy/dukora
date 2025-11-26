"use cache";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userSettingsTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

export const get_all = async (userId: string) => {
  if (!userId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const settings = await db
      .select()
      .from(userSettingsTable)
      .where(eq(userSettingsTable.userId, userId));
    return { data: settings, error: null };
  } catch (error) {
    console.error("Failed to fetch user settings:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
