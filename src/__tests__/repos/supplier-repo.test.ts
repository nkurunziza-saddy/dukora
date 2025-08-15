import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { suppliersTable, auditLogsTable } from "@/lib/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  get_all,
  get_by_id,
  create,
  update,
  remove,
  create_many,
} from "@/server/repos/supplier-repo";

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
      suppliersTable: {
        findFirst: vi.fn(),
      },
    },
    transaction: vi
      .fn()
      .mockImplementation(async (callback) => await callback(db)),
  },
}));

describe("Supplier Repo", () => {
  const mockBusinessId = "biz1";
  const mockUserId = "user1";
  const mockSupplier = {
    id: "sup1",
    name: "Test Supplier",
    businessId: mockBusinessId,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get_all", () => {
    it("should return all suppliers for a business", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([mockSupplier]),
      });

      const result = await get_all(mockBusinessId);
      expect(result).toEqual({ data: [mockSupplier], error: null });
      expect(db.select).toHaveBeenCalledWith();
      expect(db.select().from).toHaveBeenCalledWith(suppliersTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        and(
          eq(suppliersTable.businessId, mockBusinessId),
          isNull(suppliersTable.deletedAt)
        )
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
    it("should return a supplier by ID", async () => {
      (db.query.suppliersTable.findFirst as vi.Mock).mockResolvedValue(
        mockSupplier
      );

      const result = await get_by_id(mockSupplier.id, mockBusinessId);
      expect(result).toEqual({ data: mockSupplier, error: null });
      expect(db.query.suppliersTable.findFirst).toHaveBeenCalledWith({
        where: and(
          eq(suppliersTable.id, mockSupplier.id),
          eq(suppliersTable.businessId, mockBusinessId)
        ),
        with: expect.any(Object),
      });
    });

    it("should return MISSING_INPUT if supplierId or businessId is missing", async () => {
      let result = await get_by_id("", mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await get_by_id(mockSupplier.id, "");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return SUPPLIER_NOT_FOUND if supplier is not found", async () => {
      (db.query.suppliersTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );

      const result = await get_by_id(mockSupplier.id, mockBusinessId);
      expect(result).toEqual({
        data: null,
        error: ErrorCode.SUPPLIER_NOT_FOUND,
      });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.suppliersTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await get_by_id(mockSupplier.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create", () => {
    it("should create a new supplier and audit log", async () => {
      const newSupplierData = {
        name: "New Supplier",
        businessId: mockBusinessId,
      };
      const createdSupplier = { id: "newSup", ...newSupplierData };

      (db.insert as vi.Mock).mockImplementation((table) => {
        if (table === suppliersTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([createdSupplier]),
          };
        } else if (table === auditLogsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{}]),
          };
        }
        return {};
      });

      const result = await create(mockBusinessId, mockUserId, newSupplierData);
      expect(result).toEqual({ data: createdSupplier, error: null });
      expect(db.insert).toHaveBeenCalledWith(suppliersTable);
      expect(db.insert).toHaveBeenCalledWith(auditLogsTable);
    });

    it("should return MISSING_INPUT if supplier name or businessId is missing", async () => {
      let result = await create(mockBusinessId, mockUserId, {
        name: "",
        businessId: mockBusinessId,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create(mockBusinessId, mockUserId, {
        name: "New Supplier",
        businessId: "",
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await create(mockBusinessId, mockUserId, {
        name: "New Supplier",
        businessId: mockBusinessId,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("update", () => {
    it("should update an existing supplier and audit log", async () => {
      const updates = { name: "Updated Supplier Name" };
      const updatedSupplier = { ...mockSupplier, ...updates };

      (db.transaction as vi.Mock).mockImplementation(async (callback) => {
        (db.update as vi.Mock).mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([updatedSupplier]),
        });
        (db.insert as vi.Mock).mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([{}]),
        });
        return await callback(db);
      });

      const result = await update(
        mockSupplier.id,
        mockBusinessId,
        mockUserId,
        updates
      );
      expect(result).toEqual({ data: updatedSupplier, error: null });
    });

    it("should return MISSING_INPUT if supplierId or businessId is missing", async () => {
      let result = await update("", mockBusinessId, mockUserId, {});
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await update(mockSupplier.id, "", mockUserId, {});
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return SUPPLIER_NOT_FOUND if supplier to update is not found", async () => {
      (db.transaction as vi.Mock).mockImplementation(async (callback) => {
        (db.update as vi.Mock).mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([]), // No supplier found
        });
        return await callback(db);
      });

      const result = await update(
        mockSupplier.id,
        mockBusinessId,
        mockUserId,
        {}
      );
      expect(result).toEqual({
        data: null,
        error: ErrorCode.SUPPLIER_NOT_FOUND,
      });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.transaction as vi.Mock).mockRejectedValue(new Error("DB error"));

      const result = await update(
        mockSupplier.id,
        mockBusinessId,
        mockUserId,
        {}
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("remove", () => {
    it("should soft delete a supplier and create audit log", async () => {
      (db.query.suppliersTable.findFirst as vi.Mock).mockResolvedValue(
        mockSupplier
      );
      (db.transaction as vi.Mock).mockImplementation(async (callback) => {
        (db.update as vi.Mock).mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockSupplier]),
        });
        (db.insert as vi.Mock).mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([{}]),
        });
        return await callback(db);
      });

      const result = await remove(mockSupplier.id, mockBusinessId, mockUserId);
      expect(result).toEqual({ data: mockSupplier, error: null });
    });

    it("should return MISSING_INPUT if supplierId or businessId is missing", async () => {
      let result = await remove("", mockBusinessId, mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await remove(mockSupplier.id, "", mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return SUPPLIER_NOT_FOUND if supplier to delete is not found", async () => {
      (db.query.suppliersTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );

      const result = await remove(mockSupplier.id, mockBusinessId, mockUserId);
      expect(result).toEqual({
        data: null,
        error: ErrorCode.SUPPLIER_NOT_FOUND,
      });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.suppliersTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await remove(mockSupplier.id, mockBusinessId, mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create_many", () => {
    it("should create multiple suppliers", async () => {
      const newSuppliersData = [
        { name: "Sup A", businessId: mockBusinessId },
        { name: "Sup B", businessId: mockBusinessId },
      ];
      (db.insert as vi.Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(newSuppliersData),
      });

      const result = await create_many(newSuppliersData);
      expect(result).toEqual({ data: newSuppliersData, error: null });
      expect(db.insert).toHaveBeenCalledWith(suppliersTable);
      expect(db.insert().values).toHaveBeenCalledWith(newSuppliersData);
    });

    it("should return MISSING_INPUT if suppliers array is empty", async () => {
      const result = await create_many([]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return MISSING_INPUT if businessId is inconsistent or missing", async () => {
      let result = await create_many([{ name: "Sup A", businessId: "" }]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create_many([
        { name: "Sup A", businessId: mockBusinessId },
        { name: "Sup B", businessId: "anotherBiz" },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await create_many([
        { name: "Sup A", businessId: mockBusinessId },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
