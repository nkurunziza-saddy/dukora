import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { warehousesTable, auditLogsTable } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  get_all,
  get_by_id,
  create,
  update,
  remove,
  create_many,
} from "@/server/repos/warehouse-repo";

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
          orderBy: vi.fn(),
        })),
      })),
    })),
    query: {
      warehousesTable: {
        findFirst: vi.fn(),
      },
    },
    transaction: vi
      .fn()
      .mockImplementation(async (callback) => await callback(db)),
  },
}));

describe("Warehouse Repo", () => {
  const mockBusinessId = "biz1";
  const mockUserId = "user1";
  const mockWarehouse = {
    id: "wh1",
    name: "Main Warehouse",
    businessId: mockBusinessId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get_all", () => {
    it("should return all warehouses for a business", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([mockWarehouse]),
      });

      const result = await get_all(mockBusinessId);
      expect(result).toEqual({ data: [mockWarehouse], error: null });
      expect(db.select).toHaveBeenCalledWith();
      expect(db.select().from).toHaveBeenCalledWith(warehousesTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        eq(warehousesTable.businessId, mockBusinessId)
      );
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await get_all("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_all(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_by_id", () => {
    it("should return a warehouse by ID", async () => {
      (db.query.warehousesTable.findFirst as vi.Mock).mockResolvedValue(
        mockWarehouse
      );

      const result = await get_by_id(mockWarehouse.id, mockBusinessId);
      expect(result).toEqual({ data: mockWarehouse, error: null });
      expect(db.query.warehousesTable.findFirst).toHaveBeenCalledWith({
        where: and(
          eq(warehousesTable.id, mockWarehouse.id),
          eq(warehousesTable.businessId, mockBusinessId)
        ),
        with: expect.any(Object),
      });
    });

    it("should return MISSING_INPUT if warehouseId or businessId is missing", async () => {
      let result = await get_by_id("", mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await get_by_id(mockWarehouse.id, "");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return NOT_FOUND if warehouse is not found", async () => {
      (db.query.warehousesTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );

      const result = await get_by_id(mockWarehouse.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.warehousesTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await get_by_id(mockWarehouse.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create", () => {
    it("should create a new warehouse and audit log", async () => {
      const newWarehouseData = {
        name: "New Warehouse",
        businessId: mockBusinessId,
      };
      const createdWarehouse = { id: "newWh", ...newWarehouseData };

      (db.insert as vi.Mock).mockImplementation((table) => {
        if (table === warehousesTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([createdWarehouse]),
          };
        } else if (table === auditLogsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{}]),
          };
        }
        return {};
      });

      const result = await create(newWarehouseData, mockUserId);
      expect(result).toEqual({ data: createdWarehouse, error: null });
      expect(db.insert).toHaveBeenCalledWith(warehousesTable);
      expect(db.insert).toHaveBeenCalledWith(auditLogsTable);
    });

    it("should return MISSING_INPUT if warehouse name or businessId is missing", async () => {
      let result = await create(
        { name: "", businessId: mockBusinessId },
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create(
        { name: "New Warehouse", businessId: "" },
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return ALREADY_EXISTS if warehouse with same name already exists", async () => {
      (db.query.warehousesTable.findFirst as vi.Mock).mockResolvedValue(
        mockWarehouse
      );

      const result = await create(
        { name: "Main Warehouse", businessId: mockBusinessId },
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.ALREADY_EXISTS });
      expect(db.insert).not.toHaveBeenCalled();
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.warehousesTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await create(
        { name: "New Warehouse", businessId: mockBusinessId },
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("update", () => {
    it("should update an existing warehouse and audit log", async () => {
      const updates = { name: "Updated Warehouse Name" };
      const updatedWarehouse = { ...mockWarehouse, ...updates };

      (db.update as vi.Mock).mockImplementation((table) => {
        if (table === warehousesTable) {
          return {
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([updatedWarehouse]),
          };
        } else if (table === auditLogsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{}]),
          };
        }
        return {};
      });

      const result = await update(
        mockWarehouse.id,
        mockBusinessId,
        mockUserId,
        updates
      );
      expect(result).toEqual({ data: updatedWarehouse, error: null });
      expect(db.update).toHaveBeenCalledWith(warehousesTable);
      expect(db.insert).toHaveBeenCalledWith(auditLogsTable);
    });

    it("should return MISSING_INPUT if warehouseId or businessId is missing", async () => {
      let result = await update("", mockBusinessId, mockUserId, {});
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await update(mockWarehouse.id, "", mockUserId, {});
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return NOT_FOUND if warehouse to update is not found", async () => {
      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      });

      const result = await update(
        mockWarehouse.id,
        mockBusinessId,
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
        mockWarehouse.id,
        mockBusinessId,
        mockUserId,
        {}
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("remove", () => {
    it("should delete a warehouse if it has no items and create audit log", async () => {
      (db.query.warehousesTable.findFirst as vi.Mock).mockResolvedValue({
        ...mockWarehouse,
        warehouseItems: [],
      });
      (db.delete as vi.Mock).mockImplementation((table) => {
        if (table === warehousesTable) {
          return {
            where: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([mockWarehouse]),
          };
        } else if (table === auditLogsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{}]),
          };
        }
        return {};
      });

      const result = await remove(mockWarehouse.id, mockBusinessId, mockUserId);
      expect(result).toEqual({ data: mockWarehouse, error: null });
      expect(db.delete).toHaveBeenCalledWith(warehousesTable);
      expect(db.insert).toHaveBeenCalledWith(auditLogsTable);
    });

    it("should return MISSING_INPUT if warehouseId or businessId is missing", async () => {
      let result = await remove("", mockBusinessId, mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await remove(mockWarehouse.id, "", mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return NOT_FOUND if warehouse to delete is not found", async () => {
      (db.query.warehousesTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );

      const result = await remove(mockWarehouse.id, mockBusinessId, mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });

    it("should return CANNOT_DELETE if warehouse has items", async () => {
      (db.query.warehousesTable.findFirst as vi.Mock).mockResolvedValue({
        ...mockWarehouse,
        warehouseItems: [{ id: "item1" }],
      });

      const result = await remove(mockWarehouse.id, mockBusinessId, mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.CANNOT_DELETE });
      expect(db.delete).not.toHaveBeenCalled();
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.warehousesTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await remove(mockWarehouse.id, mockBusinessId, mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create_many", () => {
    it("should create multiple warehouses", async () => {
      const newWarehousesData = [
        { name: "Wh A", businessId: mockBusinessId },
        { name: "Wh B", businessId: mockBusinessId },
      ];
      (db.transaction as vi.Mock).mockResolvedValue(newWarehousesData);

      const result = await create_many(newWarehousesData, mockUserId);
      expect(result).toEqual({ data: newWarehousesData, error: null });
    });

    it("should return MISSING_INPUT if warehouses array is empty", async () => {
      const result = await create_many([], mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return MISSING_INPUT if businessId is inconsistent or missing", async () => {
      let result = await create_many(
        [{ name: "Wh A", businessId: "" }],
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create_many(
        [
          { name: "Wh A", businessId: mockBusinessId },
          { name: "Wh B", businessId: "anotherBiz" },
        ],
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.transaction as vi.Mock).mockRejectedValue(new Error("DB error"));

      const result = await create_many(
        [{ name: "Wh A", businessId: mockBusinessId }],
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
