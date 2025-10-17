"use server";
import { revalidatePath } from "next/cache";
import type { InsertBusiness } from "@/lib/schema/schema-types";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as businessRepo from "../repos/business-repo";

export const getBusinesses = createProtectedAction(
  Permission.BUSINESS_VIEW,
  async () => {
    const businesses = await businessRepo.get_all();
    if (businesses.error) {
      return { data: null, error: businesses.error };
    }
    return { data: businesses.data, error: null };
  },
);

export const getBusinessById = createProtectedAction(
  Permission.BUSINESS_VIEW,
  async (_user, businessId: string) => {
    if (!businessId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const business = await businessRepo.get_by_id_cached(businessId);
    if (business.error) {
      return { data: null, error: business.error };
    }
    return { data: business.data, error: null };
  },
);

export const createBusiness = async (
  businessData: Omit<InsertBusiness, "id">,
) => {
  const session = await getCurrentSession();
  if (!session) {
    return { data: null, error: ErrorCode.UNAUTHORIZED };
  }
  if (!businessData.name?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const res = await businessRepo.create(
    session.user.id,
    businessData as InsertBusiness,
  );
  if (res.error) {
    return { data: null, error: res.error };
  }
  revalidatePath("/", "layout");
  return { data: res.data, error: null };
};

export const updateBusiness = createProtectedAction(
  Permission.BUSINESS_UPDATE,
  async (
    user,
    {
      businessId,
      updates,
    }: {
      businessId: string;
      updates: Partial<Omit<InsertBusiness, "id">>;
    },
  ) => {
    if (!businessId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedBusiness = await businessRepo.update(
      businessId,
      user.id,
      updates,
    );
    if (updatedBusiness.error) {
      return { data: null, error: updatedBusiness.error };
    }
    revalidatePath("/", "layout");
    return { data: updatedBusiness.data, error: null };
  },
);

export const deleteBusiness = createProtectedAction(
  Permission.BUSINESS_DELETE,
  async (user, businessId: string) => {
    if (!businessId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const res = await businessRepo.remove(businessId, user.id);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidatePath("/", "layout");
    return { data: { success: true }, error: null };
  },
);

export const createManyBusinesses = createProtectedAction(
  Permission.BUSINESS_CREATE,
  async (_user, businessesData: Omit<InsertBusiness, "id">[]) => {
    if (!businessesData?.length) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const businesses: InsertBusiness[] = businessesData as InsertBusiness[];
    const createdBusinesses = await businessRepo.create_many(businesses);
    if (createdBusinesses.error) {
      return { data: null, error: createdBusinesses.error };
    }
    revalidatePath("/", "layout");
    return { data: createdBusinesses.data, error: null };
  },
);
