// filepath: /home/saddy/projects/web-based/quantra/src/server/repos/category.ts
"use server";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { revalidateTag, unstable_cache } from "next/cache";
import { categoriesTable } from "@/lib/schema";
import type { InsertCategory } from "@/lib/schema/schema-types";
import { ErrorCode } from "../constants/errors";

export async function getAll(businessId: string) {
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
}

export const getAllCached = async (businessId: string) =>
  unstable_cache(
    async () => await getAll(businessId),
    ["categories", businessId],
    {
      revalidate: 300,
      tags: [`categories-${businessId}`],
    }
  );

export async function getById(categoryId: string, businessId: string) {
  if (!categoryId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const category = await db.query.categoriesTable.findFirst({
      where: and(
        eq(categoriesTable.id, categoryId),
        eq(categoriesTable.businessId, businessId)
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

export const getByIdCached = async (categoryId: string, businessId: string) =>
  unstable_cache(
    async () => await getById(categoryId, businessId),
    ["categories", categoryId, businessId],
    {
      revalidate: 300,
      tags: [`categories-${businessId}`, `category-${categoryId}`],
    }
  );

export async function create(category: InsertCategory) {
  if (!category.name || !category.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db
      .insert(categoriesTable)
      .values(category)
      .returning();

    revalidateTag(`categories-${category.businessId}`);

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  categoryId: string,
  businessId: string,
  updates: Partial<InsertCategory>
) {
  if (!categoryId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db
      .update(categoriesTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(categoriesTable.id, categoryId),
          eq(categoriesTable.businessId, businessId)
        )
      )
      .returning();

    if (result.length === 0) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    revalidateTag(`categories-${businessId}`);
    revalidateTag(`category-${categoryId}`);

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(categoryId: string, businessId: string) {
  if (!categoryId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db
      .delete(categoriesTable)
      .where(
        and(
          eq(categoriesTable.id, categoryId),
          eq(categoriesTable.businessId, businessId)
        )
      )
      .returning();

    if (result.length === 0) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    revalidateTag(`categories-${businessId}`);
    revalidateTag(`category-${categoryId}`);

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createMany(categories: InsertCategory[]) {
  if (!categories.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  const businessId = categories[0]?.businessId;
  if (!businessId || !categories.every((c) => c.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .insert(categoriesTable)
      .values(categories)
      .returning();

    revalidateTag(`categories-${businessId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create categories:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
