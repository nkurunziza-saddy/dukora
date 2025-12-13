"use server";

import { revalidateTag } from "next/cache";
import type { InsertUserSetting } from "@/lib/schema/schema.types";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as userSettingsRepo from "@/server/repos/users/user-settings-repo";

export const getUserSettings = createProtectedAction(
  PERMISSION.USER_VIEW,
  async (user) => {
    const settings = await userSettingsRepo.get_all(user.id);
    if (settings.error) {
      return { data: null, error: settings.error };
    }
    return { data: settings.data, error: null };
  }
);

export const upsertUserSettings = createProtectedAction(
  PERMISSION.USER_UPDATE,
  async (
    user,
    settingsData: Partial<Omit<InsertUserSetting, "id" | "userId">>[]
  ) => {
    if (!settingsData?.length) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }

    const promises = settingsData.map((setting) => {
      const newSetting: InsertUserSetting = {
        ...setting,
        key: setting.key as string,
        value: setting.value as string,
        userId: user.id,
        updatedAt: new Date(),
      };
      return userSettingsRepo.upsert(
        user.id,
        user.businessId ?? "",
        newSetting
      );
    });

    const results = await Promise.all(promises);

    const errors = results.filter((res) => res.error);
    if (errors.length > 0) {
      return { data: null, error: ERROR_CODE.FAILED_REQUEST, errors };
    }
    revalidateTag(`user-settings-${user.businessId}`, "max");
    revalidateTag(`user-settings`, "max");
    return { data: { success: true }, error: null };
  }
);
