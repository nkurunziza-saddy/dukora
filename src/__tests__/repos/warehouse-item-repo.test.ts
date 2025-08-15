import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  warehouseItemsTable,
  auditLogsTable,
  warehousesTable,
  productsTable,
} from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  get_all,
  get_all_by_business_id,
  get_by_id,
  create,
  update,
  remove,
  create_many,
} from "@/server/repos/warehouse-item-repo";

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          innerJoin: vi.fn(),
        })),
      })),
    })),
    query: {
      warehouseItemsTable: {
        findFirst: vi.fn(),
      },
    },
    transaction: vi.fn((callback) => callback(db)),
  },
}));

describe("Warehouse Item Repo", () => {
  const mockBusinessId = "biz1";
  const mockUserId = "user1";
  const mockWarehouseId = "wh1";
  const mockProductId = "prod1";
  const mockWarehouseItem = {
    id: "whi1",
    warehouseId: mockWarehouseId,
    productId: mockProductId,
    quantity: 10,
    lastUpdated: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get_all", () => {
    it("should return all warehouse items for a warehouse", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockWarehouseItem]),
      });

      const result = await get_all(mockWarehouseId);
      expect(result).toEqual({ data: [mockWarehouseItem], error: null });
      expect(db.select).toHaveBeenCalledWith();
      expect(db.select().from).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        eq(warehouseItemsTable.warehouseId, mockWarehouseId)
      );
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_all(mockWarehouseId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_all_by_business_id", () => {
    it("should return all warehouse items for a business", async () => {
      const mockData = [
        {
          warehouseItem: mockWarehouseItem,
          product: { id: mockProductId, name: "Test Product" },
        },
      ];
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockData),
      });

      const result = await get_all_by_business_id(mockBusinessId);
      expect(result).toEqual({ data: mockData, error: null });
      expect(db.select).toHaveBeenCalledWith({
        warehouseItem: warehouseItemsTable,
        product: productsTable,
      });
      expect(db.select().from).toHaveBeenCalledWith(warehousesTable);
      expect(db.select().from().innerJoin).toHaveBeenCalledWith(
        warehouseItemsTable,
        eq(warehousesTable.id, warehouseItemsTable.warehouseId)
      );
      expect(db.select().from().innerJoin().innerJoin).toHaveBeenCalledWith(
        productsTable,
        eq(warehouseItemsTable.productId, productsTable.id)
      );
      expect(
        db.select().from().innerJoin().innerJoin().where
      ).toHaveBeenCalledWith(eq(warehousesTable.businessId, mockBusinessId));
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_all_by_business_id(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_by_id", () => {
    it("should return a warehouse item by ID", async () => {
      (db.query.warehouseItemsTable.findFirst as vi.Mock).mockResolvedValue(
        mockWarehouseItem
      );

      const result = await get_by_id(mockWarehouseItem.id);
      expect(result).toEqual({ data: mockWarehouseItem, error: null });
      expect(db.query.warehouseItemsTable.findFirst).toHaveBeenCalledWith({
        where: and(eq(warehouseItemsTable.id, mockWarehouseItem.id)),
        with: expect.any(Object),
      });
    });

    it("should return NOT_FOUND if warehouse item is not found", async () => {
      (db.query.warehouseItemsTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );

      const result = await get_by_id(mockWarehouseItem.id);
      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.warehouseItemsTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await get_by_id(mockWarehouseItem.id);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create", () => {
    it("should create a new warehouse item and audit log", async () => {
      const newWarehouseItemData = {
        warehouseId: mockWarehouseId,
        productId: mockProductId,
        quantity: 5,
      };
      const createdWarehouseItem = { id: "newWhi", ...newWarehouseItemData };

      (db.insert as vi.Mock).mockImplementation((table) => {
        if (table === warehouseItemsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([createdWarehouseItem]),
          };
        } else if (table === auditLogsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{}]),
          };
        }
        return {};
      });

      const result = await create(
        mockBusinessId,
        mockUserId,
        newWarehouseItemData
      );
      expect(result).toEqual({ data: createdWarehouseItem, error: null });
      expect(db.insert).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.insert).toHaveBeenCalledWith(auditLogsTable);
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await create(
        mockBusinessId,
        mockUserId,
        mockWarehouseItem
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("update", () => {
    it("should update an existing warehouse item and audit log", async () => {
      const updates = { quantity: 15 };
      const updatedWarehouseItem = { ...mockWarehouseItem, ...updates };

      (db.update as vi.Mock).mockImplementation((table) => {
        if (table === warehouseItemsTable) {
          return {
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([updatedWarehouseItem]),
          };
        }
        return {};
      });
      (db.insert as vi.Mock).mockImplementation((table) => {
        if (table === auditLogsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{}]),
          };
        }
        return {};
      });
      (db.query.warehouseItemsTable.findFirst as vi.Mock).mockResolvedValue(
        mockWarehouseItem
      );

      const result = await update(
        mockBusinessId,
        mockWarehouseItem.id,
        mockUserId,
        updates
      );
      expect(result).toEqual({ data: updatedWarehouseItem, error: null });
      expect(db.update).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.insert).toHaveBeenCalledWith(auditLogsTable);
    });

    it("should return NOT_FOUND if warehouse item to update is not found", async () => {
      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      });

      const result = await update(
        mockBusinessId,
        mockWarehouseItem.id,
        mockUserId,
        {}
      );
      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.update as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await update(
        mockBusinessId,
        mockWarehouseItem.id,
        mockUserId,
        {}
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("remove", () => {
    it("should delete a warehouse item and audit log", async () => {
      (db.query.warehouseItemsTable.findFirst as vi.Mock).mockResolvedValue(
        mockWarehouseItem
      );
      (db.delete as vi.Mock).mockImplementation((table) => {
        if (table === warehouseItemsTable) {
          return {
            where: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([mockWarehouseItem]),
          };
        }
        return {};
      });
      (db.insert as vi.Mock).mockImplementation((table) => {
        if (table === auditLogsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{}]),
          };
        }
        return {};
      });

      const result = await remove(
        mockWarehouseItem.id,
        mockBusinessId,
        mockUserId
      );
      expect(result).toEqual({ data: mockWarehouseItem, error: null });
      expect(db.delete).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.insert).toHaveBeenCalledWith(auditLogsTable);
    });

    it("should return NOT_FOUND if warehouse item to delete is not found", async () => {
      (db.query.warehouseItemsTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );
      (db.delete as vi.Mock).mockImplementation((table) => {
        if (table === warehouseItemsTable) {
          return {
            where: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([]),
          };
        }
        return {};
      });

      const result = await remove(
        mockWarehouseItem.id,
        mockBusinessId,
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.warehouseItemsTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await remove(
        mockWarehouseItem.id,
        mockBusinessId,
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create_many", () => {
    it("should create multiple warehouse items", async () => {
      const newWarehouseItemsData = [
        { warehouseId: mockWarehouseId, productId: "prod2", quantity: 5 },
        { warehouseId: mockWarehouseId, productId: "prod3", quantity: 8 },
      ];
      (db.insert as vi.Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(newWarehouseItemsData),
      });

      const result = await create_many(newWarehouseItemsData);
      expect(result).toEqual({ data: newWarehouseItemsData, error: null });
      expect(db.insert).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.insert().values).toHaveBeenCalledWith(newWarehouseItemsData);
    });

    it("should return MISSING_INPUT if warehouse items array is empty", async () => {
      const result = await create_many([]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return MISSING_INPUT if warehouseId is inconsistent or missing", async () => {
      let result = await create_many([
        { warehouseId: "", productId: "prod2", quantity: 5 },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create_many([
        { warehouseId: mockWarehouseId, productId: "prod2", quantity: 5 },
        { warehouseId: "anotherWh", productId: "prod3", quantity: 8 },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await create_many([
        { warehouseId: mockWarehouseId, productId: "prod2", quantity: 5 },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
