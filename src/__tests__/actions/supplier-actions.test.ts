import { describe, it, expect, vi, beforeEach } from "vitest";
import * as supplierActions from "@/server/actions/supplier-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import * as authActions from "@/server/actions/auth-actions";
import * as supplierRepo from "@/server/repos/supplier-repo";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";

// Mock dependencies
vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/repos/supplier-repo");
vi.mock("@/server/helpers/role-permissions");

describe("Supplier Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockSupplier = {
    id: "sup-1",
    name: "Test Supplier",
    businessId: "biz-1",
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as vi.Mock).mockResolvedValue({
      user: mockUser,
    });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  });

  describe("getSuppliers", () => {
    it("should return suppliers if user has permission", async () => {
      (supplierRepo.get_all_cached as vi.Mock).mockResolvedValue({
        data: [mockSupplier],
        error: null,
      });

      const result = await supplierActions.getSuppliers();
      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.SUPPLIER_VIEW
      );
      expect(supplierRepo.get_all_cached).toHaveBeenCalledWith(mockUser.businessId);
      expect(result).toEqual({ data: [mockSupplier], error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await supplierActions.getSuppliers();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(supplierRepo.get_all).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all fails", async () => {
      (supplierRepo.get_all_cached as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await supplierActions.getSuppliers();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getSupplierById", () => {
    it("should return supplier by id if user has permission", async () => {
      (supplierRepo.get_by_id_cached as vi.Mock).mockResolvedValue({
        data: mockSupplier,
        error: null,
      });

      const result = await supplierActions.getSupplierById(mockSupplier.id);

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.SUPPLIER_VIEW
      );
      expect(supplierRepo.get_by_id_cached).toHaveBeenCalledWith(
        mockSupplier.id,
        mockUser.businessId
      );
      expect(result).toEqual({ data: mockSupplier, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await supplierActions.getSupplierById(mockSupplier.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(supplierRepo.get_by_id_cached).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if supplierId is empty", async () => {
      const result = await supplierActions.getSupplierById(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(supplierRepo.get_by_id_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_id_cached fails", async () => {
      (supplierRepo.get_by_id_cached as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.NOT_FOUND,
      });

      const result = await supplierActions.getSupplierById(mockSupplier.id);

      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });
  });

  describe("createSupplier", () => {
    const newSupplierData = { name: "New Supplier" };

    it("should create a supplier successfully", async () => {
      (supplierRepo.create as vi.Mock).mockResolvedValue({
        data: mockSupplier,
        error: null,
      });

      const result = await supplierActions.createSupplier(newSupplierData);

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.SUPPLIER_CREATE
      );
      expect(supplierRepo.create).toHaveBeenCalledWith(
        mockUser.businessId,
        mockUser.id,
        {
          ...newSupplierData,
          businessId: mockUser.businessId,
        }
      );
      expect(result).toEqual({ data: mockSupplier, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await supplierActions.createSupplier(newSupplierData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(supplierRepo.create).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if supplier name is empty", async () => {
      const result = await supplierActions.createSupplier({
        ...newSupplierData,
        name: " ",
      });

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(supplierRepo.create).not.toHaveBeenCalled();
    });

    it("should return error from repo if create fails", async () => {
      (supplierRepo.create as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await supplierActions.createSupplier(newSupplierData);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("updateSupplier", () => {
    const updates = { name: "Updated Supplier Name" };

    it("should update a supplier successfully", async () => {
      (supplierRepo.update as vi.Mock).mockResolvedValue({
        data: { ...mockSupplier, ...updates },
        error: null,
      });

      const result = await supplierActions.updateSupplier({
        supplierId: mockSupplier.id,
        updates,
      });

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.SUPPLIER_UPDATE
      );
      expect(supplierRepo.update).toHaveBeenCalledWith(
        mockSupplier.id,
        mockUser.businessId,
        mockUser.id,
        updates
      );
      expect(result).toEqual({
        data: { ...mockSupplier, ...updates },
        error: null,
      });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await supplierActions.updateSupplier({
        supplierId: mockSupplier.id,
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(supplierRepo.update).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if supplierId is empty", async () => {
      const result = await supplierActions.updateSupplier({
        supplierId: " ",
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(supplierRepo.update).not.toHaveBeenCalled();
    });

    it("should return error from repo if update fails", async () => {
      (supplierRepo.update as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await supplierActions.updateSupplier({
        supplierId: mockSupplier.id,
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("deleteSupplier", () => {
    it("should delete a supplier successfully", async () => {
      (supplierRepo.remove as vi.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await supplierActions.deleteSupplier(mockSupplier.id);

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.SUPPLIER_DELETE
      );
      expect(supplierRepo.remove).toHaveBeenCalledWith(
        mockSupplier.id,
        mockUser.businessId,
        mockUser.id
      );
      expect(result).toEqual({ data: { success: true }, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await supplierActions.deleteSupplier(mockSupplier.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(supplierRepo.remove).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if supplierId is empty", async () => {
      const result = await supplierActions.deleteSupplier(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(supplierRepo.remove).not.toHaveBeenCalled();
    });

    it("should return error from repo if remove fails", async () => {
      (supplierRepo.remove as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await supplierActions.deleteSupplier(mockSupplier.id);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("createManySuppliers", () => {
    const newSuppliersData = [{ name: "Supplier A" }, { name: "Supplier B" }];

    it("should create many suppliers successfully", async () => {
      (supplierRepo.create_many as vi.Mock).mockResolvedValue({
        data: newSuppliersData,
        error: null,
      });

      const result = await supplierActions.createManySuppliers(
        newSuppliersData
      );

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.SUPPLIER_CREATE
      );
      expect(supplierRepo.create_many).toHaveBeenCalledWith(
        newSuppliersData.map((s) => ({ ...s, businessId: mockUser.businessId }))
      );
      expect(result).toEqual({ data: newSuppliersData, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await supplierActions.createManySuppliers(
        newSuppliersData
      );

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(supplierRepo.create_many).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if suppliersData is empty", async () => {
      const result = await supplierActions.createManySuppliers([]);

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(supplierRepo.create_many).not.toHaveBeenCalled();
    });

    it("should return error from repo if create_many fails", async () => {
      (supplierRepo.create_many as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await supplierActions.createManySuppliers(
        newSuppliersData
      );

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });
});
