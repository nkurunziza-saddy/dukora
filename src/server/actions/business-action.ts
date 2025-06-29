"use server";
import type { InsertBusiness } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import {
  getAll as getAllBusinessesRepo,
  getById as getBusinessByIdRepo,
  create as createBusinessRepo,
  update as updateBusinessRepo,
  remove as removeBusinessRepo,
  createMany as createManyBusinessesRepo,
} from "../repos/business-repo";
import { revalidateTag } from "next/cache";

export async function getBusinesses() {
  const currentUser = await getUserIfHasPermission(Permission.BUSINESS_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const businesses = await getAllBusinessesRepo();
    if (businesses.error) {
      return { data: null, error: businesses.error };
    }
    return { data: businesses.data, error: null };
  } catch (error) {
    console.error("Error getting businesses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getBusinessById(businessId: string) {
  const currentUser = await getUserIfHasPermission(Permission.BUSINESS_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!businessId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const business = await getBusinessByIdRepo(businessId);
    if (business.error) {
      return { data: null, error: business.error };
    }
    return { data: business.data, error: null };
  } catch (error) {
    console.error("Error getting business:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createBusiness(businessData: Omit<InsertBusiness, "id">) {
  const currentUser = await getUserIfHasPermission(
    Permission.BUSINESS_CREATE,
    "4738a33a-3b92-5ef0-be32-f71a7b026d67-invoke"
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!businessData.name?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const res = await createBusinessRepo(
      currentUser.id,
      businessData as InsertBusiness
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag("businesses");
    revalidateTag(`business-${res.data.id}`);
    return { data: res.data, error: null };
  } catch (error) {
    console.error("Error creating business:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function updateBusiness(
  businessId: string,
  updates: Partial<Omit<InsertBusiness, "id">>
) {
  const currentUser = await getUserIfHasPermission(Permission.BUSINESS_UPDATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!businessId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const updatedBusiness = await updateBusinessRepo(
      businessId,
      currentUser.id,
      updates
    );
    if (updatedBusiness.error) {
      return { data: null, error: updatedBusiness.error };
    }
    revalidateTag("businesses");
    revalidateTag(`business-${businessId}`);
    return { data: updatedBusiness.data, error: null };
  } catch (error) {
    console.error("Error updating business:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteBusiness(businessId: string) {
  const currentUser = await getUserIfHasPermission(Permission.BUSINESS_DELETE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!businessId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const res = await removeBusinessRepo(businessId, currentUser.id);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag("businesses");
    revalidateTag(`business-${businessId}`);
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error deleting business:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createManyBusinesses(
  businessesData: Omit<InsertBusiness, "id">[]
) {
  const currentUser = await getUserIfHasPermission(Permission.BUSINESS_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!businessesData?.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const businesses: InsertBusiness[] = businessesData as InsertBusiness[];
    const createdBusinesses = await createManyBusinessesRepo(businesses);
    if (createdBusinesses.error) {
      return { data: null, error: createdBusinesses.error };
    }
    revalidateTag("businesses");
    return { data: createdBusinesses.data, error: null };
  } catch (error) {
    console.error("Error creating businesses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
