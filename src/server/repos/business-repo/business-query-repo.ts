"use cache";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessesTable } from "@/lib/schema";
import { ErrorCode } from "../../constants/errors";

export const get_all = async () => {
  try {
    const res = await db
      .select()
      .from(businessesTable)
      .where(eq(businessesTable.isActive, true));
    return { data: res, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export async function get_by_id(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const business = await db.query.businessesTable.findFirst({
      where: eq(businessesTable.id, businessId),
      with: {
        categories: true,
        businessSettings: true,
        warehouses: true,
      },
    });

    if (!business) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    return { data: business, error: null };
  } catch (error) {
    console.error("Failed to fetch business:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
