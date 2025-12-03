"use server";

import type { OnboardingFormData } from "@/components/onboarding/onboarding-utils";
import { createManyInvitations } from "@/server/actions/invitation-actions";
import { ERROR_CODE } from "../constants/errors";
import { PERMISSION } from "../constants/permissions";
import { getUserIfHasPermission } from "./auth/permission-middleware";
import { createBusiness } from "./business/business-actions";
import { upsertManyCategories } from "./business/categories-actions";
import { upsertManyBusinessSettings } from "./business/settings-actions";
import { createManyWarehouses } from "./warehouse/warehouses-actions";

export async function businessInitialization(data: OnboardingFormData) {
  const currentUser = await getUserIfHasPermission(PERMISSION.PRODUCT_VIEW);
  if (!currentUser) return { data: null, error: ERROR_CODE.UNAUTHORIZED };

  try {
    const {
      teamMembers,
      warehouses,
      businessName,
      businessType,
      categories,
      ...businessSettings
    } = data;
    const businessData = {
      name: businessName,
      businessType,
    };

    const businessSettingsRecordArray = Object.entries(businessSettings)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map((item) => ({
        key: item[0],
        value: String(item[1]),
      }));

    const business = await createBusiness(businessData);

    if (business.error) {
      return { data: null, error: business.error };
    }

    const [invitation, warehouse, category, settings] = await Promise.all([
      createManyInvitations(teamMembers),
      createManyWarehouses({ created: warehouses, deleted: [] }),
      upsertManyCategories(categories),
      upsertManyBusinessSettings(businessSettingsRecordArray),
    ]);
    if (invitation.error) {
      return {
        data: null,
        error: invitation.error,
      };
    }
    if (category.error) {
      return {
        data: null,
        error: category.error,
      };
    }
    if (warehouse.error) {
      return {
        data: null,
        error: warehouse.error,
      };
    }
    if (settings.error) {
      return {
        data: null,
        error: settings.error,
      };
    }
    return {
      data: {
        business: business.data,
        invitation: invitation.data,
        warehouse: warehouse.data,
        category: category.data,
        settings: settings.data,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error getting products:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
