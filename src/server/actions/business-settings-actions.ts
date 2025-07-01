"use server";

import type { InsertBusinessSetting } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import { createProtectedAction } from "@/server/helpers/action-factory";
import {
  getAll as getAllBusinessSettingsRepo,
  getById as getBusinessSettingByIdRepo,
  create as createBusinessSettingRepo,
  update as updateBusinessSettingRepo,
  remove as removeBusinessSettingRepo,
  createMany as createManyBusinessSettingsRepo,
} from "../repos/business-settings-repo";

export const getBusinessSettings = createProtectedAction(
  Permission.BUSINESS_SETTINGS_VIEW,
  async (user) => {
    const settings = await getAllBusinessSettingsRepo(user.businessId!);
    if (settings.error) {
      return { data: null, error: settings.error };
    }
    return { data: settings.data, error: null };
  }
);

export const getBusinessSettingById = createProtectedAction(
  Permission.BUSINESS_SETTINGS_VIEW,
  async (user, settingId: string) => {
    if (!settingId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const setting = await getBusinessSettingByIdRepo(settingId, user.businessId!);
    if (setting.error) {
      return { data: null, error: setting.error };
    }
    return { data: setting.data, error: null };
  }
);

export const createBusinessSetting = createProtectedAction(
  Permission.BUSINESS_SETTINGS_CREATE,
  async (
    user,
    settingData: Omit<InsertBusinessSetting, "businessId" | "id">
  ) => {
    if (!settingData.key?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const setting: InsertBusinessSetting = {
      ...settingData,
      businessId: user.businessId!,
    };
    const res = await createBusinessSettingRepo(
      user.businessId!,
      user.id,
      setting
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`business-settings-${user.businessId!}`);
    return { data: res.data, error: null };
  }
);

export const updateBusinessSetting = createProtectedAction(
  Permission.BUSINESS_SETTINGS_UPDATE,
  async (
    user,
    { 
      settingId,
      updates,
    }: {
      settingId: string;
      updates: Partial<Omit<InsertBusinessSetting, "id" | "businessId">>;
    }
  ) => {
    if (!settingId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedSetting = await updateBusinessSettingRepo(
      settingId,
      user.businessId!,
      user.id,
      updates
    );
    if (updatedSetting.error) {
      return { data: null, error: updatedSetting.error };
    }
    revalidateTag(`business-settings-${user.businessId!}`);
    revalidateTag(`business-setting-${settingId}`);
    return { data: updatedSetting.data, error: null };
  }
);

export const deleteBusinessSetting = createProtectedAction(
  Permission.BUSINESS_SETTINGS_DELETE,
  async (user, settingId: string) => {
    if (!settingId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const res = await removeBusinessSettingRepo(
      settingId,
      user.businessId!,
      user.id
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`business-settings-${user.businessId!}`);
    revalidateTag(`business-setting-${settingId}`);
    return { data: { success: true }, error: null };
  }
);

export const createManyBusinessSettings = createProtectedAction(
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
    const createdSettings = await createManyBusinessSettingsRepo(settings);
    if (createdSettings.error) {
      return { data: null, error: createdSettings.error };
    }
    revalidateTag(`business-settings-${user.businessId!}`);
    return { data: createdSettings.data, error: null };
  }
);
