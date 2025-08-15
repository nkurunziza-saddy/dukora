import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  warehousesTable,
  warehouseItemsTable,
  productsTable,
} from "@/lib/schema";
import { count, eq, sum } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  getTotalWarehouses,
  getTotalQuantity,
  getQuantityByProduct,
  getQuantityByWarehouse,
  getQuantityByProductAndWarehouse,
} from "@/server/repos/statistics/warehouse-stat-repo";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            groupBy: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

describe("Warehouse Statistics Repo", () => {
  const mockBusinessId = "biz1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTotalWarehouses", () => {
    it("should return the total count of warehouses for a business", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 3 }]),
      });

      const result = await getTotalWarehouses(mockBusinessId);
      expect(result).toEqual({ data: 3, error: null });
      expect(db.select).toHaveBeenCalledWith({ count: count(warehousesTable) });
      expect(db.select().from).toHaveBeenCalledWith(warehousesTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        eq(warehousesTable.businessId, mockBusinessId)
      );
    });

    it("should return 0 if no warehouses found", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      });

      const result = await getTotalWarehouses(mockBusinessId);
      expect(result).toEqual({ data: 0, error: null });
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getTotalWarehouses("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getTotalWarehouses(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("getTotalQuantity", () => {
    it("should return the total quantity of all warehouse items for a business", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ totalQuantity: 150 }]),
      });

      const result = await getTotalQuantity(mockBusinessId);
      expect(result).toBe(150);
      expect(db.select).toHaveBeenCalledWith({
        totalQuantity: sum(warehouseItemsTable.quantity),
      });
      expect(db.select().from).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.select().from().innerJoin).toHaveBeenCalledWith(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id)
      );
      expect(db.select().from().innerJoin().where).toHaveBeenCalledWith(
        eq(warehousesTable.businessId, mockBusinessId)
      );
    });

    it("should return 0 if no items found", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      });

      const result = await getTotalQuantity(mockBusinessId);
      expect(result).toBe(0);
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getTotalQuantity("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getTotalQuantity(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("getQuantityByProduct", () => {
    it("should return total quantity grouped by product", async () => {
      const mockData = [{ productId: "prod1", totalQuantity: 50 }];
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockResolvedValue(mockData),
      });

      const result = await getQuantityByProduct(mockBusinessId);
      expect(result).toEqual(mockData);
      expect(db.select).toHaveBeenCalledWith({
        productId: warehouseItemsTable.productId,
        totalQuantity: sum(warehouseItemsTable.quantity),
      });
      expect(db.select().from).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.select().from().innerJoin).toHaveBeenCalledWith(
        productsTable,
        eq(warehouseItemsTable.productId, productsTable.id)
      );
      expect(db.select().from().innerJoin().where).toHaveBeenCalledWith(
        eq(productsTable.businessId, mockBusinessId)
      );
      expect(
        db.select().from().innerJoin().where().groupBy
      ).toHaveBeenCalledWith(warehouseItemsTable.productId);
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getQuantityByProduct("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getQuantityByProduct(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("getQuantityByWarehouse", () => {
    it("should return total quantity grouped by warehouse", async () => {
      const mockData = [{ warehouseId: "wh1", totalQuantity: 100 }];
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockResolvedValue(mockData),
      });

      const result = await getQuantityByWarehouse(mockBusinessId);
      expect(result).toEqual(mockData);
      expect(db.select).toHaveBeenCalledWith({
        warehouseId: warehouseItemsTable.warehouseId,
        totalQuantity: sum(warehouseItemsTable.quantity),
      });
      expect(db.select().from).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.select().from().innerJoin).toHaveBeenCalledWith(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id)
      );
      expect(db.select().from().innerJoin().where).toHaveBeenCalledWith(
        eq(warehousesTable.businessId, mockBusinessId)
      );
      expect(
        db.select().from().innerJoin().where().groupBy
      ).toHaveBeenCalledWith(warehouseItemsTable.warehouseId);
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getQuantityByWarehouse("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getQuantityByWarehouse(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("getQuantityByProductAndWarehouse", () => {
    it("should return total quantity grouped by product and warehouse", async () => {
      const mockData = [
        { productId: "prod1", warehouseId: "wh1", totalQuantity: 50 },
      ];
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockResolvedValue(mockData),
      });

      const result = await getQuantityByProductAndWarehouse(mockBusinessId);
      expect(result).toEqual(mockData);
      expect(db.select).toHaveBeenCalledWith({
        productId: warehouseItemsTable.productId,
        warehouseId: warehouseItemsTable.warehouseId,
        totalQuantity: sum(warehouseItemsTable.quantity),
      });
      expect(db.select().from).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.select().from().innerJoin).toHaveBeenCalledWith(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id)
      );
      expect(db.select().from().innerJoin().innerJoin).toHaveBeenCalledWith(
        productsTable,
        eq(warehouseItemsTable.productId, productsTable.id)
      );
      expect(
        db.select().from().innerJoin().innerJoin().where().groupBy
      ).toHaveBeenCalledWith(
        warehouseItemsTable.productId,
        warehouseItemsTable.warehouseId
      );
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getQuantityByProductAndWarehouse("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getQuantityByProductAndWarehouse(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
