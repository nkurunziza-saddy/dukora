"use cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categoriesTable } from "@/lib/schema";
import { ErrorCode } from "../../constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const categories = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.businessId, businessId))
      .orderBy(desc(categoriesTable.createdAt));
    return { data: categories, error: null };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export async function get_by_id(categoryId: string, businessId: string) {
  if (!categoryId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const category = await db.query.categoriesTable.findFirst({
      where: and(
        eq(categoriesTable.id, categoryId),
        eq(categoriesTable.businessId, businessId),
      ),
    });

    if (!category) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: category, error: null };
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
