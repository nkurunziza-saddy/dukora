"use server";

import type { OnboardingFormData } from "@/app/[locale]/(onboarding)/onboarding/_components/onboarding-form";
import { ErrorCode } from "../constants/errors";
import { Permission } from "../constants/permissions";
import { getUserIfHasPermission } from "./auth/permission-middleware";
import { createManyInvitations } from "@/server/actions/invitation-actions";
import { createManyWarehouses } from "./warehouse-actions";
import { createBusiness } from "./business-actions";
import { upsertManyCategories } from "./category-actions";
import { upsertManyBusinessSettings } from "./business-settings-actions";

export async function businessInitialization(data: OnboardingFormData) {
  const currentUser = await getUserIfHasPermission(Permission.PRODUCT_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

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

    const businessSettingsRecordArray = Object.entries(businessSettings).map(
      (item) => ({
        key: item[0],
        value: item[1],
      })
    );

    const business = await createBusiness(businessData);

    if (business.error) {
      return { data: null, error: business.error };
    }

    const [invitation, warehouse, category, settings] = await Promise.all([
      createManyInvitations(teamMembers),
      createManyWarehouses(warehouses),
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
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
