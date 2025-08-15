import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
  fetchCategories,
  fetchCategoryById,
  upsertCategory,
  updateCategory,
  deleteCategory,
  upsertManyCategories,
} from "@/server/actions/category-actions";
import * as categoryRepo from "@/server/repos/category-repo";
import * as authActions from "@/server/actions/auth-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { revalidatePath } from "next/cache";

vi.mock("@/server/repos/category-repo");

vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/helpers/role-permissions");
vi.mock("next/cache", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    revalidatePath: vi.fn(),
  };
});

describe("Category Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockCategory = {
    id: "cat-1",
    value: "Electronics",
    businessId: "biz-1",
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as Mock).mockResolvedValue({
      user: mockUser,
    });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  });

  describe("fetchCategories", () => {
    it("should return categories if user has permission", async () => {
      (categoryRepo.get_all_cached as Mock).mockResolvedValue({
        data: [mockCategory],
        error: null,
      });

      const result = await fetchCategories();

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.CATEGORY_VIEW
      );
      expect(categoryRepo.get_all_cached).toHaveBeenCalledWith(
        mockUser.businessId
      );
      expect(result).toEqual({ data: [mockCategory], error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await fetchCategories();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(categoryRepo.get_all_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all_cached fails", async () => {
      (categoryRepo.get_all_cached as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await fetchCategories();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("fetchCategoryById", () => {
    it("should return category by id if user has permission", async () => {
      (categoryRepo.get_by_id as Mock).mockResolvedValue({
        data: mockCategory,
        error: null,
      });

      const result = await fetchCategoryById(mockCategory.id);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.CATEGORY_VIEW
      );
      expect(categoryRepo.get_by_id).toHaveBeenCalledWith(
        mockCategory.id,
        mockUser.businessId
      );
      expect(result).toEqual({ data: mockCategory, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await fetchCategoryById(mockCategory.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(categoryRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return missing input error if categoryId is empty", async () => {
      const result = await fetchCategoryById(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(categoryRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_id fails", async () => {
      (categoryRepo.get_by_id as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.NOT_FOUND,
      });

      const result = await fetchCategoryById(mockCategory.id);

      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });
  });

  describe("upsertCategory", () => {
    const newCategoryValue = "New Category";

    it("should upsert a category successfully", async () => {
      (categoryRepo.create as Mock).mockResolvedValue({
        data: mockCategory,
        error: null,
      });

      const result = await upsertCategory(newCategoryValue);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.CATEGORY_CREATE
      );
      expect(categoryRepo.create).toHaveBeenCalledWith(
        { value: newCategoryValue, businessId: mockUser.businessId },
        mockUser.id
      );
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(result).toEqual({ data: mockCategory, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await upsertCategory(newCategoryValue);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(categoryRepo.create).not.toHaveBeenCalled();
    });

    it("should return missing input error if categoryData is empty", async () => {
      const result = await upsertCategory(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(categoryRepo.create).not.toHaveBeenCalled();
    });

    it("should return error from repo if create fails", async () => {
      (categoryRepo.create as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await upsertCategory(newCategoryValue);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("updateCategory", () => {
    const updates = { value: "Updated Category" };

    it("should update a category successfully", async () => {
      (categoryRepo.update as Mock).mockResolvedValue({
        data: { ...mockCategory, ...updates },
        error: null,
      });

      const result = await updateCategory({
        categoryId: mockCategory.id,
        updates,
      });

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.CATEGORY_UPDATE
      );
      expect(categoryRepo.update).toHaveBeenCalledWith(
        mockCategory.id,
        mockUser.businessId,
        mockUser.id,
        updates
      );
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(result).toEqual({
        data: { ...mockCategory, ...updates },
        error: null,
      });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await updateCategory({
        categoryId: mockCategory.id,
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(categoryRepo.update).not.toHaveBeenCalled();
    });

    it("should return missing input error if categoryId is empty", async () => {
      const result = await updateCategory({ categoryId: " ", updates });

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(categoryRepo.update).not.toHaveBeenCalled();
    });

    it("should return error from repo if update fails", async () => {
      (categoryRepo.update as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await updateCategory({
        categoryId: mockCategory.id,
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("deleteCategory", () => {
    it("should delete a category successfully", async () => {
      (categoryRepo.remove as Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await deleteCategory(mockCategory.id);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.CATEGORY_DELETE
      );
      expect(categoryRepo.remove).toHaveBeenCalledWith(
        mockCategory.id,
        mockUser.businessId,
        mockUser.id
      );
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(result).toEqual({ data: { success: true }, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await deleteCategory(mockCategory.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(categoryRepo.remove).not.toHaveBeenCalled();
    });

    it("should return missing input error if categoryId is empty", async () => {
      const result = await deleteCategory(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(categoryRepo.remove).not.toHaveBeenCalled();
    });

    it("should return error from repo if remove fails", async () => {
      (categoryRepo.remove as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });
      const result = await deleteCategory(mockCategory.id);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("upsertManyCategories", () => {
    const categoriesToUpsert = ["Category A", "Category B"];

    it("should upsert many categories successfully", async () => {
      (categoryRepo.upsert_many as Mock).mockResolvedValue({
        data: categoriesToUpsert,
        error: null,
      });

      const result = await upsertManyCategories(categoriesToUpsert);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.CATEGORY_CREATE
      );
      expect(categoryRepo.upsert_many).toHaveBeenCalledWith(
        expect.arrayContaining([
          { value: "Category A", businessId: mockUser.businessId },
          { value: "Category B", businessId: mockUser.businessId },
        ]),
        mockUser.id
      );
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(result).toEqual({
        data: { data: categoriesToUpsert, error: null },
        error: null,
      });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await upsertManyCategories(categoriesToUpsert);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(categoryRepo.upsert_many).not.toHaveBeenCalled();
    });

    it("should return missing input error if categoriesData is null", async () => {
      const result = await upsertManyCategories(null as any);

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(categoryRepo.upsert_many).not.toHaveBeenCalled();
    });

    it("should return error from repo if upsert_many fails", async () => {
      (categoryRepo.upsert_many as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await upsertManyCategories(categoriesToUpsert);

      expect(result).toEqual({
        data: { data: null, error: ErrorCode.DATABASE_ERROR },
        error: null,
      });
    });
  });
});
