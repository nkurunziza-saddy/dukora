"use server";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { revalidatePath, unstable_cache } from "next/cache";
import { categoriesTable, auditLogsTable } from "@/lib/schema";
import type { InsertCategory, InsertAuditLog } from "@/lib/schema/schema-types";
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
      }
  );

export async function create(category: InsertCategory, userId: string) {
  if (!category.name || !category.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db.transaction(async (tx) => {
      const [newCategory] = await tx
        .insert(categoriesTable)
        .values(category)
        .returning();

      const auditData: InsertAuditLog = {
        businessId: category.businessId,
        model: "category",
        recordId: newCategory.id,
        action: "create-category",
        changes: JSON.stringify(category),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return newCategory;
    });

    revalidatePath("/dashboard/categories");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  categoryId: string,
  businessId: string,
  userId: string,
  updates: Partial<InsertCategory>
) {
  if (!categoryId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db.transaction(async (tx) => {
      const [updatedCategory] = await tx
        .update(categoriesTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(
            eq(categoriesTable.id, categoryId),
            eq(categoriesTable.businessId, businessId)
          )
        )
        .returning();

      if (!updatedCategory) {
        return null;
      }

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "category",
        recordId: updatedCategory.id,
        action: "update-category",
        changes: JSON.stringify(updates),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return updatedCategory;
    });

    if (!result) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    revalidatePath("/dashboard/categories");
    revalidatePath(`/dashboard/categories/${categoryId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(
  categoryId: string,
  businessId: string,
  userId: string
) {
  if (!categoryId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const existingRecord = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.id, categoryId),
    });
    if (!existingRecord) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }
    const result = await db.transaction(async (tx) => {
      const [deletedCategory] = await tx
        .delete(categoriesTable)
        .where(
          and(
            eq(categoriesTable.id, categoryId),
            eq(categoriesTable.businessId, businessId)
          )
        )
        .returning();

      if (!deletedCategory) {
        return null;
      }

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "category",
        recordId: categoryId,
        action: "delete-category",
        changes: JSON.stringify(existingRecord),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return deletedCategory;
    });

    if (!result) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    revalidatePath("/dashboard/categories");
    revalidatePath(`/dashboard/categories/${categoryId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createMany(categories: InsertCategory[], userId: string) {
  if (categories === null) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  const businessId = categories[0]?.businessId;
  if (!businessId || !categories.every((c) => c.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(categoriesTable)
        .values(categories)
        .returning();

      const auditLogs: InsertAuditLog[] = inserted.map((cat, idx) => ({
        businessId: businessId,
        model: "category",
        recordId: cat.id,
        action: "create-category",
        changes: JSON.stringify(categories[idx]),
        performedBy: userId,
        performedAt: new Date(),
      }));

      if (auditLogs.length) {
        await tx.insert(auditLogsTable).values(auditLogs);
      }

      return inserted;
    });

    revalidatePath("/dashboard/categories");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create categories:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
