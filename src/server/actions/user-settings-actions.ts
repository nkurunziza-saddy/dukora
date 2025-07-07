"use server";

import type { InsertUserSetting } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as userSettingsRepo from "../repos/user-settings-repo";

export const getUserSettings = createProtectedAction(
  Permission.USER_VIEW,
  async (user) => {
    const settings = await userSettingsRepo.get_all_cached(user.id);
    if (settings.error) {
      return { data: null, error: settings.error };
    }
    return { data: settings.data, error: null };
  }
);

export const upsertUserSettings = createProtectedAction(
  Permission.USER_UPDATE,
  async (
    user,
    settingsData: Partial<Omit<InsertUserSetting, "id" | "userId">>[]
  ) => {
    if (!settingsData?.length) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }

    const promises = settingsData.map((setting) => {
      const newSetting: InsertUserSetting = {
        ...setting,
        key: setting.key as string,
        value: setting.value as string,
        userId: user.id,
        updatedAt: new Date(),
      };
      return userSettingsRepo.upsert(user.id, user.businessId!, newSetting);
    });

    const results = await Promise.all(promises);

    const errors = results.filter((res) => res.error);
    if (errors.length > 0) {
      return { data: null, error: ErrorCode.FAILED_REQUEST, errors };
    }

    return { data: { success: true }, error: null };
  }
);
