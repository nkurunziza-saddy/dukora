"use server";

import { revalidateTag } from "next/cache";
import type { InsertBusinessSetting } from "@/lib/schema/schema-types";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as businessSettingsRepo from "../repos/business-settings-repo";

export const getBusinessSettings = createProtectedAction(
  PERMISSION.BUSINESS_SETTINGS_VIEW,
  async (user) => {
    const settings = await businessSettingsRepo.get_all(user.businessId ?? "");
    if (settings.error) {
      return { data: null, error: settings.error };
    }
    return { data: settings.data, error: null };
  }
);

export const upsertBusinessSettings = createProtectedAction(
  PERMISSION.BUSINESS_SETTINGS_UPDATE,
  async (
    user,
    settingsData: Partial<Omit<InsertBusinessSetting, "id" | "businessId">>[]
  ) => {
    if (!settingsData?.length) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }

    const promises = settingsData.map((setting) => {
      const newSetting: InsertBusinessSetting = {
        ...setting,
        key: setting.key as string,
        value: setting.value as string,
        businessId: user.businessId ?? "",
      };
      return businessSettingsRepo.upsert(
        user.businessId ?? "",
        user.id,
        newSetting
      );
    });

    const results = await Promise.all(promises);

    const errors = results.filter((res) => res.error);
    if (errors.length > 0) {
      return { data: null, error: ERROR_CODE.FAILED_REQUEST, errors };
    }
    revalidateTag(`business-settings-${user.businessId}`, "max");
    revalidateTag(`business-settings`, "max");
    return { data: { success: true }, error: null };
  }
);

export const upsertManyBusinessSettings = createProtectedAction(
  PERMISSION.BUSINESS_SETTINGS_CREATE,
  async (
    user,
    settingsData: Omit<InsertBusinessSetting, "businessId" | "id">[]
  ) => {
    if (settingsData === null) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const settings: InsertBusinessSetting[] = settingsData.map((setting) => ({
      ...setting,
      businessId: user.businessId ?? "",
    }));
    const createdSettings = await businessSettingsRepo.upsert_many(
      user.id,
      settings
    );
    if (createdSettings.error) {
      return { data: null, error: createdSettings.error };
    }
    revalidateTag(`business-settings-${user.businessId}`, "max");
    revalidateTag(`business-settings`, "max");
    return { data: createdSettings.data, error: null };
  }
);
