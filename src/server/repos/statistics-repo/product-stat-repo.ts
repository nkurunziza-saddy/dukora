"use cache";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productsTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const get_total_products = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const products = await db
      .select({ count: count(productsTable) })
      .from(productsTable)
      .where(eq(productsTable.businessId, businessId));
    return { data: products[0].count, error: null };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
