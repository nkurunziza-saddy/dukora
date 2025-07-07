"use server";
import type { InsertCategory } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as categoryRepo from "../repos/category-repo";
import { revalidatePath } from "next/cache";

export const fetchCategories = createProtectedAction(
  Permission.CATEGORY_VIEW,
  async (user) => {
    const categories = await categoryRepo.get_all_cached(user.businessId!);
    if (categories.error) {
      return { data: null, error: categories.error };
    }
    return { data: categories.data, error: null };
  }
);

export const fetchCategoryById = createProtectedAction(
  Permission.CATEGORY_VIEW,
  async (user, categoryId: string) => {
    if (!categoryId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const category = await categoryRepo.get_by_id(categoryId, user.businessId!);
    if (category.error) {
      return { data: null, error: category.error };
    }
    return { data: category.data, error: null };
  }
);

export const upsertCategory = createProtectedAction(
  Permission.CATEGORY_CREATE,
  async (user, categoryData: Omit<InsertCategory, "businessId" | "id">) => {
    if (!categoryData.name?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const category: InsertCategory = {
      ...categoryData,
      businessId: user.businessId!,
    };
    const { data: resData, error: resError } = await categoryRepo.create(
      category,
      user.id
    );
    if (resError) {
      return { data: null, error: resError };
    }
    revalidatePath("/", "layout");
    return { data: resData, error: null };
  }
);

export const updateCategory = createProtectedAction(
  Permission.CATEGORY_UPDATE,
  async (
    user,
    {
      categoryId,
      updates,
    }: {
      categoryId: string;
      updates: Partial<Omit<InsertCategory, "id" | "businessId">>;
    }
  ) => {
    if (!categoryId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedCategory = await categoryRepo.update(
      categoryId,
      user.businessId!,
      user.id,
      updates
    );
    if (updatedCategory.error) {
      return { data: null, error: updatedCategory.error };
    }
    revalidatePath("/", "layout");
    return { data: updatedCategory.data, error: null };
  }
);

export const deleteCategory = createProtectedAction(
  Permission.CATEGORY_DELETE,
  async (user, categoryId: string) => {
    if (!categoryId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    await categoryRepo.remove(categoryId, user.businessId!, user.id);
    revalidatePath("/", "layout");
    return { data: { success: true }, error: null };
  }
);

export const upsertManyCategories = createProtectedAction(
  Permission.CATEGORY_CREATE,
  async (user, categoriesData: Omit<InsertCategory, "businessId" | "id">[]) => {
    if (categoriesData === null) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const categories: InsertCategory[] = categoriesData.map((category) => ({
      ...category,
      businessId: user.businessId!,
    }));
    const createdCategories = await categoryRepo.upsert_many(
      categories,
      user.id
    );
    revalidatePath("/", "layout");
    return { data: createdCategories, error: null };
  }
);
