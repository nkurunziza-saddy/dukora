import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
  getBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  createManyBusinesses,
} from "@/server/actions/business-actions";
import * as businessRepo from "@/server/repos/business-repo";
import * as authActions from "@/server/actions/auth-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidatePath } from "next/cache";
import { Permission } from "@/server/constants/permissions";

vi.mock("@/server/repos/business-repo");
vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/helpers/role-permissions");
vi.mock("next/cache", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    revalidatePath: vi.fn(),
  };
});

describe("Business Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockBusiness = {
    id: "biz-1",
    name: "Test Business",
    businessType: "Retail",
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  });

  describe("getBusinesses", () => {
    it("should return businesses if user has permission", async () => {
      (businessRepo.get_all as Mock).mockResolvedValue({ data: [mockBusiness], error: null });

      const result = await getBusinesses();

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.BUSINESS_VIEW
      );
      expect(businessRepo.get_all).toHaveBeenCalled();
      expect(result).toEqual({ data: [mockBusiness], error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getBusinesses();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(businessRepo.get_all).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all fails", async () => {
      (businessRepo.get_all as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await getBusinesses();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getBusinessById", () => {
    it("should return business by id if user has permission", async () => {
      (businessRepo.get_by_id_cached as Mock).mockResolvedValue({ data: mockBusiness, error: null });

      const result = await getBusinessById(mockBusiness.id);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.BUSINESS_VIEW
      );
      expect(businessRepo.get_by_id_cached).toHaveBeenCalledWith(mockBusiness.id);
      expect(result).toEqual({ data: mockBusiness, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getBusinessById(mockBusiness.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(businessRepo.get_by_id_cached).not.toHaveBeenCalled();
    });

    it("should return missing input error if businessId is empty", async () => {
      const result = await getBusinessById(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(businessRepo.get_by_id_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_id_cached fails", async () => {
      (businessRepo.get_by_id_cached as Mock).mockResolvedValue({ data: null, error: ErrorCode.NOT_FOUND });

      const result = await getBusinessById(mockBusiness.id);

      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });
  });

  describe("createBusiness", () => {
    const newBusinessData = { name: "New Business", businessType: "Service" };

    it("should create a business successfully", async () => {
      (businessRepo.create as Mock).mockResolvedValue({ data: mockBusiness, error: null });

      const result = await createBusiness(newBusinessData);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(businessRepo.create).toHaveBeenCalledWith(
        mockUser.id,
        newBusinessData
      );
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(result).toEqual({ data: mockBusiness, error: null });
    });

    it("should return unauthorized error if no session", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue(null);

      const result = await createBusiness(newBusinessData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(businessRepo.create).not.toHaveBeenCalled();
    });

    it("should return missing input error if business name is empty", async () => {
      const result = await createBusiness({ ...newBusinessData, name: " " });

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(businessRepo.create).not.toHaveBeenCalled();
    });

    it("should return error from repo if create fails", async () => {
      (businessRepo.create as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await createBusiness(newBusinessData);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("updateBusiness", () => {
    const updates = { name: "Updated Business Name" };

    it("should update a business successfully", async () => {
      (businessRepo.update as Mock).mockResolvedValue({ data: { ...mockBusiness, ...updates }, error: null });

      const result = await updateBusiness({
        businessId: mockBusiness.id,
        updates,
      });

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.BUSINESS_UPDATE
      );
      expect(businessRepo.update).toHaveBeenCalledWith(
        mockBusiness.id,
        mockUser.id,
        updates
      );
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(result).toEqual({ data: { ...mockBusiness, ...updates }, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await updateBusiness({
        businessId: mockBusiness.id,
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(businessRepo.update).not.toHaveBeenCalled();
    });

    it("should return missing input error if businessId is empty", async () => {
      const result = await updateBusiness({ businessId: " ", updates });

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(businessRepo.update).not.toHaveBeenCalled();
    });

    it("should return error from repo if update fails", async () => {
      (businessRepo.update as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await updateBusiness({ businessId: mockBusiness.id, updates });

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("deleteBusiness", () => {
    it("should delete a business successfully", async () => {
      (businessRepo.remove as Mock).mockResolvedValue({ data: { success: true }, error: null });

      const result = await deleteBusiness(mockBusiness.id);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.BUSINESS_DELETE
      );
      expect(businessRepo.remove).toHaveBeenCalledWith(mockBusiness.id, mockUser.id);
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(result).toEqual({ data: { success: true }, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await deleteBusiness(mockBusiness.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(businessRepo.remove).not.toHaveBeenCalled();
    });

    it("should return missing input error if businessId is empty", async () => {
      const result = await deleteBusiness(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(businessRepo.remove).not.toHaveBeenCalled();
    });

    it("should return error from repo if remove fails", async () => {
      (businessRepo.remove as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await deleteBusiness(mockBusiness.id);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("createManyBusinesses", () => {
    const newBusinessesData = [
      { name: "Business A", businessType: "Service" },
      { name: "Business B", businessType: "Manufacturing" },
    ];

    it("should create multiple businesses successfully", async () => {
      (businessRepo.create_many as Mock).mockResolvedValue({ data: newBusinessesData, error: null });

      const result = await createManyBusinesses(newBusinessesData);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.BUSINESS_CREATE
      );
      expect(businessRepo.create_many).toHaveBeenCalledWith(newBusinessesData);
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(result).toEqual({ data: newBusinessesData, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await createManyBusinesses(newBusinessesData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(businessRepo.create_many).not.toHaveBeenCalled();
    });

    it("should return missing input error if businessesData is empty", async () => {
      const result = await createManyBusinesses([]);

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(businessRepo.create_many).not.toHaveBeenCalled();
    });

    it("should return error from repo if create_many fails", async () => {
      (businessRepo.create_many as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await createManyBusinesses(newBusinessesData);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });
});
