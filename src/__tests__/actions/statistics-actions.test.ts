import { describe, it, expect, vi, beforeEach } from "vitest";
import * as statisticsActions from "@/server/actions/statistics-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import * as productStatRepo from "@/server/repos/statistics/product-stat-repo";
import * as warehouseStatRepo from "@/server/repos/statistics/warehouse-stat-repo";
import * as stockStatRepo from "@/server/repos/statistics/stock-stat-repo";
import * as transactionStatRepo from "@/server/repos/statistics/transactions-stat-repo";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";

import { getCurrentSession } from "@/server/actions/auth-actions";

vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/helpers/role-permissions");
vi.mock("@/server/repos/statistics/product-stat-repo");
vi.mock("@/server/repos/statistics/warehouse-stat-repo");
vi.mock("@/server/repos/statistics/stock-stat-repo");
vi.mock("@/server/repos/statistics/transactions-stat-repo");

describe("Statistics Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentSession as vi.Mock).mockResolvedValue({
      user: mockUser,
    });
    (rolePermissions.roleHasPermission as vi.Mock).mockReturnValue(true);
  });

  describe("getTotalSKUCount", () => {
    it("should return total SKU count if user has permission", async () => {
      (productStatRepo.getTotalProducts as vi.Mock).mockResolvedValue({
        data: 100,
        error: null,
      });

      const result = await statisticsActions.getTotalSKUCount();

       expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(productStatRepo.getTotalProducts).toHaveBeenCalledWith(mockUser.businessId);
      expect(result).toEqual({ data: 100, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as vi.Mock).mockReturnValue(false);

      const result = await statisticsActions.getTotalSKUCount();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(productStatRepo.getTotalProducts).not.toHaveBeenCalled();
    });

    it("should return error from repo if getTotalProducts fails", async () => {
      (productStatRepo.getTotalProducts as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await statisticsActions.getTotalSKUCount();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getTotalWarehousesCount", () => {
    it("should return total warehouses count if user has permission", async () => {
      (warehouseStatRepo.getTotalWarehouses as vi.Mock).mockResolvedValue({
        data: 5,
        error: null,
      });

      const result = await statisticsActions.getTotalWarehousesCount();

       expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(warehouseStatRepo.getTotalWarehouses).toHaveBeenCalledWith(mockUser.businessId);
      expect(result).toEqual({ data: 5, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
          (rolePermissions.roleHasPermission as vi.Mock).mockReturnValue(false);

      const result = await statisticsActions.getTotalWarehousesCount();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(warehouseStatRepo.getTotalWarehouses).not.toHaveBeenCalled();
    });

    it("should return error from repo if getTotalWarehouses fails", async () => {
      (warehouseStatRepo.getTotalWarehouses as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await statisticsActions.getTotalWarehousesCount();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getLowStockProductsCount", () => {
    it("should return low stock products count if user has permission", async () => {
      (stockStatRepo.getProductsWithStockAlert as vi.Mock).mockResolvedValue({
        data: [{ id: "prod1" }, { id: "prod2" }],
        error: null,
      });

      const result = await statisticsActions.getLowStockProductsCount();

       expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(stockStatRepo.getProductsWithStockAlert).toHaveBeenCalledWith(mockUser.businessId);
      expect(result).toEqual({ data: 2, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
          (rolePermissions.roleHasPermission as vi.Mock).mockReturnValue(false);

      const result = await statisticsActions.getLowStockProductsCount();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(stockStatRepo.getProductsWithStockAlert).not.toHaveBeenCalled();
    });

    it("should return error from repo if getProductsWithStockAlert fails", async () => {
      (stockStatRepo.getProductsWithStockAlert as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await statisticsActions.getLowStockProductsCount();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getCurrentInventoryValue", () => {
    it("should return current inventory value if user has permission", async () => {
      (stockStatRepo.getInventoryValue as vi.Mock).mockResolvedValue({
        data: 1500.75,
        error: null,
      });

      const result = await statisticsActions.getCurrentInventoryValue();

       expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(stockStatRepo.getInventoryValue).toHaveBeenCalledWith(mockUser.businessId);
      expect(result).toEqual({ data: 1500.75, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
          (rolePermissions.roleHasPermission as vi.Mock).mockReturnValue(false);

      const result = await statisticsActions.getCurrentInventoryValue();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(stockStatRepo.getInventoryValue).not.toHaveBeenCalled();
    });

    it("should return error from repo if getInventoryValue fails", async () => {
      (stockStatRepo.getInventoryValue as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await statisticsActions.getCurrentInventoryValue();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getTodayTransactions", () => {
    it("should return today's and yesterday's transaction metrics", async () => {
      const mockTodayMetrics = { totalSales: 100, totalExpenses: 50 };
      const mockYesterdayMetrics = { totalSales: 80, totalExpenses: 40 };

      (transactionStatRepo.getTransactionMetricsForInterval as vi.Mock)
        .mockResolvedValueOnce({ data: mockTodayMetrics, error: null })
        .mockResolvedValueOnce({ data: mockYesterdayMetrics, error: null });

      const result = await statisticsActions.getTodayTransactions();

       expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(transactionStatRepo.getTransactionMetricsForInterval).toHaveBeenCalledTimes(2);
      expect(result.data?.current).toEqual(mockTodayMetrics);
      expect(result.data?.prev).toEqual(mockYesterdayMetrics);
      expect(result.error).toBeNull();
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
          (rolePermissions.roleHasPermission as vi.Mock).mockReturnValue(false);

      const result = await statisticsActions.getTodayTransactions();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(transactionStatRepo.getTransactionMetricsForInterval).not.toHaveBeenCalled();
    });

    it("should handle errors from transactionStatRepo", async () => {
      (transactionStatRepo.getTransactionMetricsForInterval as vi.Mock)
        .mockResolvedValueOnce({ data: null, error: ErrorCode.DATABASE_ERROR })
        .mockResolvedValueOnce({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await statisticsActions.getTodayTransactions();

      expect(result).toEqual({ data: { current: null, prev: null }, error: null });
    });
  });
});