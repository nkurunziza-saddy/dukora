"use server";
import type { InsertCategory } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import * as categoryRepo from "../repos/category-repo";

export async function fetchCategories() {
  const currentUser = await getUserIfHasPermission(Permission.CATEGORY_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const categories = await categoryRepo.getAll(currentUser.businessId!);
    if (categories.error) {
      return { data: null, error: categories.error };
    }
    return { data: categories.data, error: null };
  } catch (error) {
    console.error("Error getting categories:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function fetchCategoryById(categoryId: string) {
  const currentUser = await getUserIfHasPermission(Permission.CATEGORY_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!categoryId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const category = await categoryRepo.getById(
      categoryId,
      currentUser.businessId!
    );

    if (category.error) {
      return { data: null, error: category.error };
    }

    return { data: category.data, error: null };
  } catch (error) {
    console.error("Error getting category:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createCategory(
  categoryData: Omit<InsertCategory, "businessId" | "id">
) {
  const currentUser = await getUserIfHasPermission(Permission.CATEGORY_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!categoryData.name?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const category: InsertCategory = {
      ...categoryData,
      businessId: currentUser.businessId!,
    };
    const { data: resData, error: resError } = await categoryRepo.create(
      category,
      currentUser.id
    );
    if (resError) {
      return { data: null, error: resError };
    }

    revalidateTag(`categories-${currentUser.businessId!}`);

    return { data: resData, error: null };
  } catch (error) {
    console.error("Error creating category:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function updateCategory(
  categoryId: string,
  updates: Partial<Omit<InsertCategory, "id" | "businessId">>
) {
  const currentUser = await getUserIfHasPermission(Permission.CATEGORY_UPDATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!categoryId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const existingCategory = await categoryRepo.getById(
    categoryId,
    currentUser.businessId!
  );

  if (!existingCategory) {
    return { data: null, error: ErrorCode.NOT_FOUND };
  }

  try {
    const updatedCategory = await categoryRepo.update(
      categoryId,
      currentUser.businessId!,
      currentUser.id,
      updates
    );
    if (updatedCategory.error) {
      return { data: null, error: updatedCategory.error };
    }

    revalidateTag(`categories-${currentUser.businessId!}`);
    revalidateTag(`category-${categoryId}`);

    return { data: updatedCategory.data, error: null };
  } catch (error) {
    console.error("Error updating category:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteCategory(categoryId: string) {
  const currentUser = await getUserIfHasPermission(Permission.CATEGORY_DELETE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!categoryId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    await categoryRepo.remove(
      categoryId,
      currentUser.businessId!,
      currentUser.id
    );

    revalidateTag(`categories-${currentUser.businessId!}`);
    revalidateTag(`category-${categoryId}`);

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error deleting category:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createManyCategories(
  categoriesData: Omit<InsertCategory, "businessId" | "id">[]
) {
  const currentUser = await getUserIfHasPermission(Permission.CATEGORY_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (categoriesData === null) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const categories: InsertCategory[] = categoriesData.map((category) => ({
      ...category,
      businessId: currentUser.businessId!,
    }));

    const createdCategories = await categoryRepo.createMany(
      categories,
      currentUser.id
    );

    revalidateTag(`categories-${currentUser.businessId!}`);

    return { data: createdCategories, error: null };
  } catch (error) {
    console.error("Error creating categories:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
