import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as productItemsActions from "@/server/actions/product-items-actions";
import * as stockStatRepo from "@/server/repos/statistics/stock-stat-repo";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import * as authActions from "@/server/actions/auth-actions";

vi.mock("@/server/helpers/role-permissions");
vi.mock("@/server/repos/statistics/stock-stat-repo");
vi.mock("@/server/actions/auth-actions");

describe("Product Items Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockProducts = [
    { id: "prod1", name: "Product A", quantity: 5 },
    { id: "prod2", name: "Product B", quantity: 0 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as Mock).mockResolvedValue({
      user: mockUser,
    });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  });

  describe("getLowStockAlertProducts", () => {
    it("should return low stock alert products if user has permission", async () => {
      (stockStatRepo.getProductsWithStockAlert as vi.Mock).mockResolvedValue({
        data: mockProducts,
        error: null,
      });

      const result = await productItemsActions.getLowStockAlertProducts({});

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.PRODUCT_VIEW
      );
      expect(stockStatRepo.getProductsWithStockAlert).toHaveBeenCalledWith(
        mockUser.businessId
      );
      expect(result).toEqual({ data: mockProducts, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await productItemsActions.getLowStockAlertProducts({});

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(stockStatRepo.getProductsWithStockAlert).not.toHaveBeenCalled();
    });

    it("should return error from repo if getProductsWithStockAlert fails", async () => {
      (stockStatRepo.getProductsWithStockAlert as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await productItemsActions.getLowStockAlertProducts({});

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getOutOfStockProducts", () => {
    it("should return out of stock products if user has permission", async () => {
      (stockStatRepo.get_by_quantity as vi.Mock).mockResolvedValue({
        data: mockProducts.filter((p) => p.quantity === 0),
        error: null,
      });

      const result = await productItemsActions.getOutOfStockProducts({});

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.WAREHOUSE_ITEM_VIEW
      );
      expect(stockStatRepo.get_by_quantity).toHaveBeenCalledWith(
        mockUser.businessId,
        0
      );
      expect(result).toEqual({
        data: mockProducts.filter((p) => p.quantity === 0),
        error: null,
      });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await productItemsActions.getOutOfStockProducts({});

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(stockStatRepo.get_by_quantity).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_quantity fails", async () => {
      (stockStatRepo.get_by_quantity as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await productItemsActions.getOutOfStockProducts({});

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getStockItemsByQuantity", () => {
    it("should return stock items by quantity if user has permission", async () => {
      (stockStatRepo.get_by_quantity as vi.Mock).mockResolvedValue({
        data: mockProducts,
        error: null,
      });

      const result = await productItemsActions.getStockItemsByQuantity(5);

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.WAREHOUSE_ITEM_VIEW
      );
      expect(stockStatRepo.get_by_quantity).toHaveBeenCalledWith(
        mockUser.businessId,
        5
      );
      expect(result).toEqual({ data: mockProducts, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await productItemsActions.getStockItemsByQuantity(5);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(stockStatRepo.get_by_quantity).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_quantity fails", async () => {
      (stockStatRepo.get_by_quantity as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await productItemsActions.getStockItemsByQuantity(5);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getNegativeStockProducts", () => {
    it("should return negative stock products if user has permission", async () => {
      const negativeStockProducts = [
        { id: "prod3", name: "Product C", quantity: -2 },
      ];
      (stockStatRepo.get_negative_item as vi.Mock).mockResolvedValue({
        data: negativeStockProducts,
        error: null,
      });

      const result = await productItemsActions.getNegativeStockProducts({});

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.PRODUCT_VIEW
      );
      expect(stockStatRepo.get_negative_item).toHaveBeenCalledWith(
        mockUser.businessId
      );
      expect(result).toEqual({ data: negativeStockProducts, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await productItemsActions.getNegativeStockProducts({});

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(stockStatRepo.get_negative_item).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_negative_item fails", async () => {
      (stockStatRepo.get_negative_item as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await productItemsActions.getNegativeStockProducts({});

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });
});
