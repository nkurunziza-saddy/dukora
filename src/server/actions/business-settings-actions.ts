"use server";

import type { InsertBusinessSetting } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import {
  getAll as getAllBusinessSettingsRepo,
  getById as getBusinessSettingByIdRepo,
  create as createBusinessSettingRepo,
  update as updateBusinessSettingRepo,
  remove as removeBusinessSettingRepo,
  createMany as createManyBusinessSettingsRepo,
} from "../repos/business-settings-repo";

export async function getBusinessSettings() {
  const currentUser = await getUserIfHasPermission(
    Permission.BUSINESS_SETTINGS_VIEW
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const settings = await getAllBusinessSettingsRepo(currentUser.businessId!);
    if (settings.error) {
      return { data: null, error: settings.error };
    }
    return { data: settings.data, error: null };
  } catch (error) {
    console.error("Error getting business settings:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getBusinessSettingById(settingId: string) {
  const currentUser = await getUserIfHasPermission(
    Permission.BUSINESS_SETTINGS_VIEW
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!settingId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const setting = await getBusinessSettingByIdRepo(
      settingId,
      currentUser.businessId!
    );

    if (setting.error) {
      return { data: null, error: setting.error };
    }

    return { data: setting.data, error: null };
  } catch (error) {
    console.error("Error getting business setting:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createBusinessSetting(
  settingData: Omit<InsertBusinessSetting, "businessId" | "id">
) {
  const currentUser = await getUserIfHasPermission(
    Permission.BUSINESS_SETTINGS_CREATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!settingData.key?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const setting: InsertBusinessSetting = {
      ...settingData,
      businessId: currentUser.businessId!,
    };

    const res = await createBusinessSettingRepo(
      currentUser.businessId!,
      currentUser.id,
      setting
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`business-settings-${currentUser.businessId!}`);

    return { data: res.data, error: null };
  } catch (error) {
    console.error("Error creating business setting:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function updateBusinessSetting(
  settingId: string,
  updates: Partial<Omit<InsertBusinessSetting, "id" | "businessId">>
) {
  const currentUser = await getUserIfHasPermission(
    Permission.BUSINESS_SETTINGS_UPDATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!settingId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const updatedSetting = await updateBusinessSettingRepo(
      settingId,
      currentUser.businessId!,
      currentUser.id,
      updates
    );
    if (updatedSetting.error) {
      return { data: null, error: updatedSetting.error };
    }

    revalidateTag(`business-settings-${currentUser.businessId!}`);
    revalidateTag(`business-setting-${settingId}`);

    return { data: updatedSetting.data, error: null };
  } catch (error) {
    console.error("Error updating business setting:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteBusinessSetting(settingId: string) {
  const currentUser = await getUserIfHasPermission(
    Permission.BUSINESS_SETTINGS_DELETE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!settingId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const res = await removeBusinessSettingRepo(
      settingId,
      currentUser.businessId!,
      currentUser.id
    );

    if (res.error) {
      return { data: null, error: res.error };
    }

    revalidateTag(`business-settings-${currentUser.businessId!}`);
    revalidateTag(`business-setting-${settingId}`);

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error deleting business setting:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createManyBusinessSettings(
  settingsData: Omit<InsertBusinessSetting, "businessId" | "id">[]
) {
  const currentUser = await getUserIfHasPermission(
    Permission.BUSINESS_SETTINGS_CREATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (settingsData === null) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const settings: InsertBusinessSetting[] = settingsData.map((setting) => ({
      ...setting,
      businessId: currentUser.businessId!,
    }));

    const createdSettings = await createManyBusinessSettingsRepo(settings);

    if (createdSettings.error) {
      return { data: null, error: createdSettings.error };
    }

    revalidateTag(`business-settings-${currentUser.businessId!}`);

    return { data: createdSettings.data, error: null };
  } catch (error) {
    console.error("Error creating business settings:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
