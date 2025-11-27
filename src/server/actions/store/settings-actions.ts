"use server";

import { cacheTag, revalidateTag } from "next/cache";
import type { InsertStoreSetting } from "@/lib/schema/schema-types";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as storeSettingsRepo from "@/server/repos/store/store-settings-repo";

async function getCachedStoreSettings(businessId: string) {
  "use cache";
  cacheTag(`store-settings-${businessId}`);
  return storeSettingsRepo.get_store_settings(businessId);
}

export const getStoreSettings = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user) => {
    const result = await getCachedStoreSettings(user.businessId ?? "");
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

export const updateStoreSettings = createProtectedAction(
  PERMISSION.PRODUCT_UPDATE,
  async (user, updates: Partial<InsertStoreSetting>) => {
    const result = await storeSettingsRepo.update_store_settings(
      user.businessId ?? "",
      user.id,
      updates
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`store-settings-${user.businessId}`, "max");
    return { data: result.data, error: null };
  }
);

export const toggleStoreEnabled = createProtectedAction(
  PERMISSION.PRODUCT_UPDATE,
  async (user, enabled: boolean) => {
    const result = await storeSettingsRepo.toggle_store_enabled(
      user.businessId ?? "",
      user.id,
      enabled
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`store-settings-${user.businessId}`, "max");
    return { data: result.data, error: null };
  }
);

export const updateDefaultWarehouse = createProtectedAction(
  PERMISSION.PRODUCT_UPDATE,
  async (user, warehouseId: string | null) => {
    const result = await storeSettingsRepo.update_default_warehouse(
      user.businessId ?? "",
      user.id,
      warehouseId
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`store-settings-${user.businessId}`, "max");
    return { data: result.data, error: null };
  }
);

async function getCachedIsStoreEnabled(businessId: string) {
  "use cache";
  cacheTag(`store-is-enabled-${businessId}`);
  return storeSettingsRepo.is_store_enabled(businessId);
}

export const isStoreEnabled = async (businessId: string) => {
  if (!businessId) {
    return { data: false, error: ERROR_CODE.MISSING_INPUT };
  }
  const result = await getCachedIsStoreEnabled(businessId);
  if (result.error) {
    return { data: false, error: result.error };
  }
  return { data: result.data, error: null };
};
