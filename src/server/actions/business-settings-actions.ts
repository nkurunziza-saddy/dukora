"use server";

import type { InsertBusinessSetting } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as businessSettingsRepo from "../repos/business-settings-repo";

export const getBusinessSettings = createProtectedAction(
  Permission.BUSINESS_SETTINGS_VIEW,
  async (user) => {
    const settings = await businessSettingsRepo.getAll(user.businessId!);
    if (settings.error) {
      return { data: null, error: settings.error };
    }
    return { data: settings.data, error: null };
  }
);

export const upsertBusinessSettings = createProtectedAction(
  Permission.BUSINESS_SETTINGS_UPDATE,
  async (
    user,
    settingsData: Partial<Omit<InsertBusinessSetting, "id" | "businessId">>[]
  ) => {
    if (!settingsData?.length) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }

    const promises = settingsData.map((setting) => {
      const newSetting: InsertBusinessSetting = {
        ...setting,
        key: setting.key as string,
        value: setting.value as string,
        businessId: user.businessId!,
      };
      return businessSettingsRepo.upsert(user.businessId!, user.id, newSetting);
    });

    const results = await Promise.all(promises);

    const errors = results.filter((res) => res.error);
    if (errors.length > 0) {
      return { data: null, error: ErrorCode.FAILED_REQUEST, errors };
    }

    return { data: { success: true }, error: null };
  }
);

export const upsertManyBusinessSettings = createProtectedAction(
  Permission.BUSINESS_SETTINGS_CREATE,
  async (
    user,
    settingsData: Omit<InsertBusinessSetting, "businessId" | "id">[]
  ) => {
    if (settingsData === null) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const settings: InsertBusinessSetting[] = settingsData.map((setting) => ({
      ...setting,
      businessId: user.businessId!,
    }));
    const createdSettings = await businessSettingsRepo.upsertMany(
      user.id,
      settings
    );
    if (createdSettings.error) {
      return { data: null, error: createdSettings.error };
    }
    return { data: createdSettings.data, error: null };
  }
);
