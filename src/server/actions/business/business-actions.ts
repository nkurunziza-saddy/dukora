"use server";
import { revalidateTag } from "next/cache";
import type { InsertBusiness } from "@/lib/schema/schema-types";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as businessRepo from "@/server/repos/business/business-repo";

export const getBusinesses = createProtectedAction(
  PERMISSION.BUSINESS_VIEW,
  async () => {
    const businesses = await businessRepo.get_all();
    if (businesses.error) {
      return { data: null, error: businesses.error };
    }
    return { data: businesses.data, error: null };
  }
);

export const getBusinessById = createProtectedAction(
  PERMISSION.BUSINESS_VIEW,
  async (_user, businessId: string) => {
    if (!businessId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const business = await businessRepo.get_by_id(businessId);
    if (business.error) {
      return { data: null, error: business.error };
    }
    return { data: business.data, error: null };
  }
);

export const getBusinessByIdMinimized = createProtectedAction(
  PERMISSION.BUSINESS_VIEW,
  async (_user, businessId: string) => {
    if (!businessId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const business = await businessRepo.get_by_id_minimized(businessId);
    if (business.error) {
      return { data: null, error: business.error };
    }
    return { data: business.data, error: null };
  }
);

export const createBusiness = async (
  businessData: Omit<InsertBusiness, "id">
) => {
  const session = await getCurrentSession();
  if (!session) {
    return { data: null, error: ERROR_CODE.UNAUTHORIZED };
  }
  if (!businessData.name?.trim()) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }
  const res = await businessRepo.create(
    session.user.id,
    businessData as InsertBusiness
  );
  if (res.error) {
    return { data: null, error: res.error };
  }
  revalidateTag(`business-${res.data.id}`, "max");
  revalidateTag(`businesses`, "max");
  return { data: res.data, error: null };
};

export const updateBusiness = createProtectedAction(
  PERMISSION.BUSINESS_UPDATE,
  async (
    user,
    {
      businessId,
      updates,
    }: {
      businessId: string;
      updates: Partial<Omit<InsertBusiness, "id">>;
    }
  ) => {
    if (!businessId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const updatedBusiness = await businessRepo.update(
      businessId,
      user.id,
      updates
    );
    if (updatedBusiness.error) {
      return { data: null, error: updatedBusiness.error };
    }
    revalidateTag(`business-${user.businessId}`, "max");
    revalidateTag(`business-${businessId}`, "max");
    return { data: updatedBusiness.data, error: null };
  }
);

export const deleteBusiness = createProtectedAction(
  PERMISSION.BUSINESS_DELETE,
  async (user, businessId: string) => {
    if (!businessId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const res = await businessRepo.remove(businessId, user.id);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`businesses-${user.businessId}`, "max");
    revalidateTag(`business-${businessId}`, "max");
    return { data: { success: true }, error: null };
  }
);

export const createManyBusinesses = createProtectedAction(
  PERMISSION.BUSINESS_CREATE,
  async (user, businessesData: Omit<InsertBusiness, "id">[]) => {
    if (!businessesData?.length) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const businesses: InsertBusiness[] = businessesData as InsertBusiness[];
    const createdBusinesses = await businessRepo.create_many(businesses);
    if (createdBusinesses.error) {
      return { data: null, error: createdBusinesses.error };
    }
    revalidateTag(`businesses-${user.businessId}`, "max");
    revalidateTag("businesses", "max");
    return { data: createdBusinesses.data, error: null };
  }
);

export const getPopularBusinesses = async (limit: number = 4) => {
  const businesses = await businessRepo.get_popular(limit);
  if (businesses.error) {
    return { data: null, error: businesses.error };
  }
  return { data: businesses.data, error: null };
};

export const getRecentBusinesses = createProtectedAction(
  PERMISSION.BUSINESS_VIEW,
  async (user, limit: number = 4) => {
    const businesses = await businessRepo.get_user_recent(user.id, limit);
    if (businesses.error) {
      return { data: null, error: businesses.error };
    }
    return { data: businesses.data, error: null };
  }
);

export const getFrequentBusinesses = createProtectedAction(
  PERMISSION.BUSINESS_VIEW,
  async (user, limit: number = 4) => {
    const businesses = await businessRepo.get_user_frequent(user.id, limit);
    if (businesses.error) {
      return { data: null, error: businesses.error };
    }
    return { data: businesses.data, error: null };
  }
);
