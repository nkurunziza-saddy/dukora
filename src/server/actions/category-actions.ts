"use server";
import { revalidateTag } from "next/cache";
import type { InsertCategory } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as categoryRepo from "../repos/category-repo";

export const getCategories = createProtectedAction(
  Permission.CATEGORY_VIEW,
  async (user) => {
    const categories = await categoryRepo.get_all(user.businessId ?? "");
    if (categories.error) {
      return { data: null, error: categories.error };
    }
    return { data: categories.data, error: null };
  },
);

export const getCategoryById = createProtectedAction(
  Permission.CATEGORY_VIEW,
  async (user, categoryId: string) => {
    if (!categoryId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const category = await categoryRepo.get_by_id(
      categoryId,
      user.businessId ?? "",
    );
    if (category.error) {
      return { data: null, error: category.error };
    }
    return { data: category.data, error: null };
  },
);

export const upsertCategory = createProtectedAction(
  Permission.CATEGORY_CREATE,
  async (user, categoryData: string) => {
    if (!categoryData.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const category: InsertCategory = {
      value: categoryData,
      businessId: user.businessId ?? "",
    };
    const { data: resData, error: resError } = await categoryRepo.create(
      category,
      user.id,
    );
    if (resError) {
      return { data: null, error: resError };
    }
    revalidateTag(`categories-${user.businessId}`, "max");
    revalidateTag("categories", "max");
    return { data: resData, error: null };
  },
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
    },
  ) => {
    if (!categoryId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedCategory = await categoryRepo.update(
      categoryId,
      user.businessId ?? "",
      user.id,
      updates,
    );
    if (updatedCategory.error) {
      return { data: null, error: updatedCategory.error };
    }
    revalidateTag(`categories-${user.businessId}`, "max");
    revalidateTag(`category-${categoryId}`, "max");
    return { data: updatedCategory.data, error: null };
  },
);

export const deleteCategory = createProtectedAction(
  Permission.CATEGORY_DELETE,
  async (user, categoryId: string) => {
    if (!categoryId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const res = await categoryRepo.remove(
      categoryId,
      user.businessId ?? "",
      user.id,
    );
    if (res.error) {
      return { data: null, error: ErrorCode.DATABASE_ERROR };
    }
    revalidateTag(`categories-${user.businessId}`, "max");
    revalidateTag(`category-${categoryId}`, "max");
    return { data: { success: true }, error: null };
  },
);

export const upsertManyCategories = createProtectedAction(
  Permission.CATEGORY_CREATE,
  async (user, categoriesData: string[]) => {
    if (categoriesData === null) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const categories: InsertCategory[] = categoriesData.map((category) => ({
      value: category,
      businessId: user.businessId ?? "",
    }));
    const createdCategories = await categoryRepo.upsert_many(
      categories,
      user.id,
    );
    revalidateTag(`categories-${user.businessId}`, "max");
    revalidateTag("categories", "max");
    return { data: createdCategories, error: null };
  },
);
