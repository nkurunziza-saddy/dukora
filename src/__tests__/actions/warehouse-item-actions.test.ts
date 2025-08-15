import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as authActions from "@/server/actions/auth-actions";
import * as warehouseItemActions from "@/server/actions/warehouse-item-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import * as warehouseItemsRepo from "@/server/repos/warehouse-item-repo";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";

vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/repos/warehouse-item-repo");
vi.mock("@/server/helpers/role-permissions");

describe("Warehouse Item Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockWarehouseItem = {
    id: "whi-1",
    warehouseId: "wh-1",
    productId: "prod-1",
    quantity: 10,
    businessId: "biz-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as Mock).mockResolvedValue({
      user: mockUser,
    });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
    (warehouseItemsRepo.remove as Mock).mockResolvedValue({
      data: null,
      error: ErrorCode.DATABASE_ERROR,
    });
  });

  describe("getWarehouseItems", () => {
    it("should return warehouse items if user has permission", async () => {
      (warehouseItemsRepo.get_all_cached as Mock).mockResolvedValue({
        data: [mockWarehouseItem],
        error: null,
      });

      const result = await warehouseItemActions.getWarehouseItems({});

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.WAREHOUSE_ITEM_VIEW
      );
      expect(warehouseItemsRepo.get_all_cached).toHaveBeenCalledWith(
        mockUser.businessId
      );
      expect(result).toEqual({ data: [mockWarehouseItem], error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await warehouseItemActions.getWarehouseItems({});

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(warehouseItemsRepo.get_all_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all_cached fails", async () => {
      (warehouseItemsRepo.get_all_cached as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await warehouseItemActions.getWarehouseItems({});

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getWarehouseItemsByBusiness", () => {
    it("should return warehouse items by business if user has permission", async () => {
      const mockRepoData = [
        {
          warehouseItem: mockWarehouseItem,
          product: { id: "prod-1", name: "Test Product" },
        },
      ];
      (warehouseItemsRepo.get_all_by_business_id as Mock).mockResolvedValue({
        data: mockRepoData,
        error: null,
      });

      const result = await warehouseItemActions.getWarehouseItemsByBusiness({});

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.WAREHOUSE_ITEM_VIEW
      );
      expect(warehouseItemsRepo.get_all_by_business_id).toHaveBeenCalledWith(
        mockUser.businessId
      );
      expect(result).toEqual({
        data: [
          {
            ...mockWarehouseItem,
            product: { id: "prod-1", name: "Test Product" },
          },
        ],
        error: null,
      });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await warehouseItemActions.getWarehouseItemsByBusiness({});

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(warehouseItemsRepo.get_all_by_business_id).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all_by_business_id fails", async () => {
      (warehouseItemsRepo.get_all_by_business_id as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await warehouseItemActions.getWarehouseItemsByBusiness({});

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getWarehouseItemById", () => {
    it("should return warehouse item by id if user has permission", async () => {
      (warehouseItemsRepo.get_by_id_cached as Mock).mockResolvedValue({
        data: mockWarehouseItem,
        error: null,
      });

      const result = await warehouseItemActions.getWarehouseItemById(
        mockWarehouseItem.id
      );

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.WAREHOUSE_ITEM_VIEW
      );
      expect(warehouseItemsRepo.get_by_id_cached).toHaveBeenCalledWith(
        mockWarehouseItem.id
      );
      expect(result).toEqual({
        data: { data: mockWarehouseItem, error: null },
        error: null,
      });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await warehouseItemActions.getWarehouseItemById(
        mockWarehouseItem.id
      );

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(warehouseItemsRepo.get_by_id_cached).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if warehouseItemId is empty", async () => {
      const result = await warehouseItemActions.getWarehouseItemById(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(warehouseItemsRepo.get_by_id_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_id_cached fails", async () => {
      (warehouseItemsRepo.get_by_id_cached as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.NOT_FOUND,
      });

      const result = await warehouseItemActions.getWarehouseItemById(
        mockWarehouseItem.id
      );

      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });
  });

  describe("createWarehouseItem", () => {
    const newWarehouseItemData = {
      warehouseId: "wh-2",
      productId: "prod-2",
      quantity: 5,
    };

    it("should create a warehouse item successfully", async () => {
      (warehouseItemsRepo.create as Mock).mockResolvedValue({
        data: mockWarehouseItem,
        error: null,
      });

      const result = await warehouseItemActions.createWarehouseItem(
        newWarehouseItemData
      );

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.WAREHOUSE_ITEM_CREATE
      );
      expect(warehouseItemsRepo.create).toHaveBeenCalledWith(
        mockUser.businessId,
        mockUser.id,
        newWarehouseItemData
      );
      expect(result).toEqual({ data: mockWarehouseItem, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await warehouseItemActions.createWarehouseItem(
        newWarehouseItemData
      );

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(warehouseItemsRepo.create).not.toHaveBeenCalled();
    });

    it("should return error from repo if create fails", async () => {
      (warehouseItemsRepo.create as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await warehouseItemActions.createWarehouseItem(
        newWarehouseItemData
      );

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("updateWarehouseItem", () => {
    const updates = { quantity: 15 };

    it("should update a warehouse item successfully", async () => {
      (warehouseItemsRepo.update as Mock).mockResolvedValue({
        data: { ...mockWarehouseItem, ...updates },
        error: null,
      });

      const result = await warehouseItemActions.updateWarehouseItem({
        warehouseItemId: mockWarehouseItem.id,
        updates,
      });

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.WAREHOUSE_ITEM_UPDATE
      );
      expect(warehouseItemsRepo.update).toHaveBeenCalledWith(
        mockUser.businessId,
        mockWarehouseItem.id,
        mockUser.id,
        updates
      );
      expect(result).toEqual({
        data: { ...mockWarehouseItem, ...updates },
        error: null,
      });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await warehouseItemActions.updateWarehouseItem({
        warehouseItemId: mockWarehouseItem.id,
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(warehouseItemsRepo.update).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if warehouseItemId is empty", async () => {
      const result = await warehouseItemActions.updateWarehouseItem({
        warehouseItemId: " ",
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(warehouseItemsRepo.update).not.toHaveBeenCalled();
    });

    it("should return error from repo if update fails", async () => {
      (warehouseItemsRepo.update as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await warehouseItemActions.updateWarehouseItem({
        warehouseItemId: mockWarehouseItem.id,
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("deleteWarehouseItem", () => {
    it("should delete a warehouse item successfully", async () => {
      (warehouseItemsRepo.remove as Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await warehouseItemActions.deleteWarehouseItem(
        mockWarehouseItem.id
      );

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.WAREHOUSE_ITEM_DELETE
      );
      expect(warehouseItemsRepo.remove).toHaveBeenCalledWith(
        mockWarehouseItem.id,
        mockUser.businessId,
        mockUser.id
      );
      expect(result).toEqual({ data: { success: true }, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await warehouseItemActions.deleteWarehouseItem(
        mockWarehouseItem.id
      );

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(warehouseItemsRepo.remove).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if warehouseItemId is empty", async () => {
      const result = await warehouseItemActions.deleteWarehouseItem(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(warehouseItemsRepo.remove).not.toHaveBeenCalled();
    });

    it("should return error from repo if remove fails", async () => {
      (warehouseItemsRepo.remove as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await warehouseItemActions.deleteWarehouseItem(
        mockWarehouseItem.id
      );

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("createManyWarehouseItems", () => {
    const newWarehouseItemsData = [
      { warehouseId: "wh-2", productId: "prod-2", quantity: 5 },
      { warehouseId: "wh-2", productId: "prod-3", quantity: 8 },
    ];

    it("should create many warehouse items successfully", async () => {
      (warehouseItemsRepo.create_many as Mock).mockResolvedValue({
        data: newWarehouseItemsData,
        error: null,
      });

      const result = await warehouseItemActions.createManyWarehouseItems(
        newWarehouseItemsData
      );

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.WAREHOUSE_ITEM_CREATE
      );
      expect(warehouseItemsRepo.create_many).toHaveBeenCalledWith(
        newWarehouseItemsData.map((item) => ({
          ...item,
          businessId: mockUser.businessId,
        }))
      );
      expect(result).toEqual({ data: newWarehouseItemsData, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await warehouseItemActions.createManyWarehouseItems(
        newWarehouseItemsData
      );

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(warehouseItemsRepo.create_many).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if warehouseItemsData is empty", async () => {
      const result = await warehouseItemActions.createManyWarehouseItems([]);

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(warehouseItemsRepo.create_many).not.toHaveBeenCalled();
    });

    it("should return error from repo if create_many fails", async () => {
      (warehouseItemsRepo.create_many as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await warehouseItemActions.createManyWarehouseItems(
        newWarehouseItemsData
      );

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });
});
