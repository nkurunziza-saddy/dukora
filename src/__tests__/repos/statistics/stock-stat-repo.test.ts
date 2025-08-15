import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  warehouseItemsTable,
  warehousesTable,
  productsTable,
} from "@/lib/schema";
import { eq, desc, asc, and, lte, sum, sql, lt } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  getProductsWithMostQuantity,
  getProductsWithLowestQuantity,
  getProductsWithStockAlert,
  get_by_quantity,
  get_negative_item,
  getInventoryValue,
  getInventoryValueByWarehouseAndProduct,
} from "@/server/repos/statistics/stock-stat-repo";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(),
            })),
            groupBy: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

describe("Stock Statistics Repo", () => {
  const mockBusinessId = "biz1";
  const mockWarehouseItem = {
    id: "whi1",
    warehouseId: "wh1",
    productId: "prod1",
    quantity: 10,
    lastUpdated: new Date(),
  };
  const mockProduct = {
    id: "prod1",
    name: "Test Product",
    price: "100.00",
    reorderPoint: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProductsWithMostQuantity", () => {
    it("should return products with most quantity", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockWarehouseItem]),
      });

      const result = await getProductsWithMostQuantity(mockBusinessId);
      expect(result).toEqual({ data: [mockWarehouseItem], error: null });
      expect(
        db.select().from().innerJoin().where().orderBy().limit
      ).toHaveBeenCalledWith(5);
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getProductsWithMostQuantity("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getProductsWithMostQuantity(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("getProductsWithLowestQuantity", () => {
    it("should return products with lowest quantity", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockWarehouseItem]),
      });

      const result = await getProductsWithLowestQuantity(mockBusinessId);
      expect(result).toEqual({ data: [mockWarehouseItem], error: null });
      expect(
        db.select().from().innerJoin().where().orderBy().limit
      ).toHaveBeenCalledWith(5);
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getProductsWithLowestQuantity("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getProductsWithLowestQuantity(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("getProductsWithStockAlert", () => {
    it("should return products with stock alert", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockWarehouseItem]),
      });

      const result = await getProductsWithStockAlert(mockBusinessId);
      expect(result).toEqual({ data: [mockWarehouseItem], error: null });
      expect(
        db.select().from().innerJoin().where().orderBy().limit
      ).toHaveBeenCalledWith(5);
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getProductsWithStockAlert("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getProductsWithStockAlert(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_by_quantity", () => {
    it("should return items with quantity less than or equal to threshold", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockWarehouseItem]),
      });

      const result = await get_by_quantity(mockBusinessId, 5);
      expect(result).toEqual({ data: [mockWarehouseItem], error: null });
      expect(db.select().from().innerJoin().where).toHaveBeenCalledWith(
        and(
          eq(warehousesTable.businessId, mockBusinessId),
          lte(warehouseItemsTable.quantity, 5)
        )
      );
    });

    it("should return items with quantity equal to threshold when fn is 'equal'", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockWarehouseItem]),
      });

      const result = await get_by_quantity(mockBusinessId, 10, "equal");
      expect(result).toEqual({ data: [mockWarehouseItem], error: null });
      expect(db.select().from().innerJoin().where).toHaveBeenCalledWith(
        and(
          eq(warehousesTable.businessId, mockBusinessId),
          eq(warehouseItemsTable.quantity, 10)
        )
      );
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await get_by_quantity("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_by_quantity(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_negative_item", () => {
    it("should return items with negative quantity", async () => {
      const negativeItem = { ...mockWarehouseItem, quantity: -5 };
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([negativeItem]),
      });

      const result = await get_negative_item(mockBusinessId);
      expect(result).toEqual({ data: [negativeItem], error: null });
      expect(db.select().from().innerJoin().where).toHaveBeenCalledWith(
        and(
          eq(warehousesTable.businessId, mockBusinessId),
          lt(warehouseItemsTable.quantity, 0)
        )
      );
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await get_negative_item("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_negative_item(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("getInventoryValue", () => {
    it("should return the total inventory value", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ totalQuantity: 10, totalValue: 1000 }]),
      });

      const result = await getInventoryValue(mockBusinessId);
      expect(result).toEqual({ data: 1000, error: null });
      expect(db.select).toHaveBeenCalledWith({
        totalQuantity: sum(warehouseItemsTable.quantity),
        totalValue: sql<number>`sum(${warehouseItemsTable.quantity} * ${productsTable.price})`,
      });
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getInventoryValue("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getInventoryValue(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("getInventoryValueByWarehouseAndProduct", () => {
    it("should return inventory value grouped by warehouse and product", async () => {
      const mockGroupedValue = [
        {
          productId: "prod1",
          warehouseId: "wh1",
          totalQuantity: 10,
          totalValue: 1000,
        },
      ];
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockResolvedValue(mockGroupedValue),
      });

      const result = await getInventoryValueByWarehouseAndProduct(
        mockBusinessId
      );
      expect(result).toEqual(mockGroupedValue);
      expect(db.select).toHaveBeenCalledWith({
        productId: warehouseItemsTable.productId,
        warehouseId: warehouseItemsTable.warehouseId,
        totalQuantity: sum(warehouseItemsTable.quantity),
        totalValue: sql<number>`sum(${warehouseItemsTable.quantity} * ${productsTable.price})`,
      });
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getInventoryValueByWarehouseAndProduct("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getInventoryValueByWarehouseAndProduct(
        mockBusinessId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
