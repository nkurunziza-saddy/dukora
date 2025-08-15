import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  transactionsTable,
  warehouseItemsTable,
  auditLogsTable,
  productsTable,
  productSuppliersTable,
  usersTable,
} from "@/lib/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  get_all,
  get_paginated,
  get_by_time_interval,
  get_time_interval_with_with,
  get_by_id,
  create,
  create_with_warehouse_item,
  get_by_type,
} from "@/server/repos/transaction-repo";
import { create as createWarehouseItem } from "@/server/repos/warehouse-item-repo";

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: "new-id" }]),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    query: {
      transactionsTable: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      warehouseItemsTable: {
        findFirst: vi.fn(),
      },
    },
    transaction: vi.fn().mockImplementation(async (callback) => {
      return await callback(db);
    }),
  },
}));
vi.mock("@/server/repos/warehouse-item-repo");

describe("Transaction Repo", () => {
  const mockBusinessId = "biz1";
  const mockUserId = "user1";
  const mockProductId = "prod1";
  const mockWarehouseId = "wh1";
  const mockWarehouseItemId = "whi1";
  const mockTransaction = {
    id: "trans1",
    productId: mockProductId,
    warehouseId: mockWarehouseId,
    warehouseItemId: mockWarehouseItemId,
    type: "SALE",
    quantity: 10,
    reference: "REF1",
    businessId: mockBusinessId,
    createdBy: mockUserId,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get_all", () => {
    it("should return all transactions for a business", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([mockTransaction]),
      });

      const result = await get_all(mockBusinessId);
      expect(result).toEqual({ data: [mockTransaction], error: null });
      expect(db.select).toHaveBeenCalledWith({
        type: transactionsTable.type,
        quantity: transactionsTable.quantity,
        reference: transactionsTable.reference,
        note: transactionsTable.note,
        createdAt: transactionsTable.createdAt,
        product: productsTable.name,
        createdBy: usersTable.name,
      });
      expect(db.select().from).toHaveBeenCalledWith(transactionsTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        eq(transactionsTable.businessId, mockBusinessId)
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

  describe("get_paginated", () => {
    it("should return paginated transactions", async () => {
      const mockTotalCount = 10;
      (db.select as vi.Mock).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: mockTotalCount }]),
      });
      (db.query.transactionsTable.findMany as vi.Mock).mockResolvedValue([
        mockTransaction,
      ]);

      const result = await get_paginated(mockBusinessId, 1, 5);
      expect(result.data).toEqual([mockTransaction]);
      expect(result.total).toBe(mockTotalCount);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(2);
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await get_paginated("");
      expect(result).toEqual({
        data: null,
        error: ErrorCode.MISSING_INPUT,
        total: 0,
      });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_paginated(mockBusinessId);
      expect(result).toEqual({
        data: null,
        error: ErrorCode.FAILED_REQUEST,
        total: 0,
      });
    });
  });

  describe("get_by_time_interval", () => {
    it("should return transactions within a time interval", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockResolvedValue([mockTransaction]),
      });

      const result = await get_by_time_interval(
        mockBusinessId,
        startDate,
        endDate
      );
      expect(result).toEqual({ data: [mockTransaction], error: null });
      expect(db.select().from().where).toHaveBeenCalledWith(
        and(
          eq(transactionsTable.businessId, mockBusinessId),
          gte(transactionsTable.createdAt, startDate),
          lte(transactionsTable.createdAt, endDate)
        )
      );
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_by_time_interval(
        mockBusinessId,
        new Date(),
        new Date()
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_time_interval_with_with", () => {
    it("should return transactions with product and user details within a time interval", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([mockTransaction]),
      });

      const result = await get_time_interval_with_with(
        mockBusinessId,
        startDate,
        endDate
      );
      expect(result).toEqual({ data: [mockTransaction], error: null });
      expect(db.select().from().where).toHaveBeenCalledWith(
        and(
          eq(transactionsTable.businessId, mockBusinessId),
          gte(transactionsTable.createdAt, startDate),
          lte(transactionsTable.createdAt, endDate)
        )
      );
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_time_interval_with_with(
        mockBusinessId,
        new Date(),
        new Date()
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_by_id", () => {
    it("should return a transaction by ID", async () => {
      (db.query.transactionsTable.findFirst as vi.Mock).mockResolvedValue(
        mockTransaction
      );

      const result = await get_by_id(mockTransaction.id, mockBusinessId);
      expect(result).toEqual({ data: mockTransaction, error: null });
      expect(db.query.transactionsTable.findFirst).toHaveBeenCalledWith({
        where: and(
          eq(transactionsTable.id, mockTransaction.id),
          eq(transactionsTable.businessId, mockBusinessId)
        ),
        with: expect.any(Object),
      });
    });

    it("should return MISSING_INPUT if transactionId or businessId is missing", async () => {
      let result = await get_by_id("", mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await get_by_id(mockTransaction.id, "");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return NOT_FOUND if transaction is not found", async () => {
      (db.query.transactionsTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );

      const result = await get_by_id(mockTransaction.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.transactionsTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await get_by_id(mockTransaction.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create", () => {
    it("should create a new transaction and update warehouse item quantity", async () => {
      const newTransactionData = {
        productId: mockProductId,
        warehouseId: mockWarehouseId,
        warehouseItemId: mockWarehouseItemId,
        type: "PURCHASE",
        quantity: 5,
        reference: "NEWREF",
        businessId: mockBusinessId,
        createdBy: mockUserId,
      };
      const createdTransaction = { id: "newTrans", ...newTransactionData };

      (db.insert as vi.Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdTransaction]),
      });
      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi
          .fn()
          .mockResolvedValue([{ id: mockWarehouseItemId, quantity: 15 }]),
      });

      const result = await create(newTransactionData);
      expect(result).toEqual({ data: createdTransaction, error: null });
      expect(db.insert).toHaveBeenCalledWith(transactionsTable);
      expect(db.update).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.insert).toHaveBeenCalledWith(auditLogsTable);
    });

    it("should return MISSING_INPUT if required fields are missing", async () => {
      let result = await create({ ...mockTransaction, productId: "" });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create({ ...mockTransaction, warehouseItemId: "" });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create({ ...mockTransaction, type: undefined as any });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create({ ...mockTransaction, quantity: undefined as any });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create({ ...mockTransaction, businessId: "" });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await create(mockTransaction);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create_with_warehouse_item", () => {
    it("should create a new transaction and warehouse item if not exists", async () => {
      const newTransactionData = {
        productId: mockProductId,
        warehouseId: mockWarehouseId,
        type: "PURCHASE",
        quantity: 5,
        reference: "NEWREF",
        businessId: mockBusinessId,
        createdBy: mockUserId,
      };
      const createdTransaction = {
        id: "newTrans",
        ...newTransactionData,
        warehouseItemId: mockWarehouseItemId,
      };
      const createdWarehouseItem = {
        id: mockWarehouseItemId,
        productId: mockProductId,
        warehouseId: mockWarehouseId,
        quantity: 5,
      };

      (db.query.warehouseItemsTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      ); // No existing item
      (createWarehouseItem as vi.Mock).mockResolvedValue({
        data: createdWarehouseItem,
        error: null,
      });
      (db.insert as vi.Mock).mockImplementation((table) => {
        if (table === transactionsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([createdTransaction]),
          };
        } else if (table === productSuppliersTable) {
          return {
            values: vi.fn().mockReturnThis(),
          };
        }
        return {};
      });

      const result = await create_with_warehouse_item(newTransactionData);
      expect(result).toEqual({ data: createdTransaction, error: null });
      expect(createWarehouseItem).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalledWith(transactionsTable);
      expect(db.insert).toHaveBeenCalledWith(productSuppliersTable);
    });

    it("should update existing warehouse item quantity and create transaction", async () => {
      const newTransactionData = {
        productId: mockProductId,
        warehouseId: mockWarehouseId,
        type: "PURCHASE",
        quantity: 5,
        reference: "NEWREF",
        businessId: mockBusinessId,
        createdBy: mockUserId,
      };
      const existingWarehouseItem = {
        id: mockWarehouseItemId,
        productId: mockProductId,
        warehouseId: mockWarehouseId,
        quantity: 10,
      };
      const updatedWarehouseItem = { ...existingWarehouseItem, quantity: 15 };
      const createdTransaction = {
        id: "newTrans",
        ...newTransactionData,
        warehouseItemId: mockWarehouseItemId,
      };

      (db.query.warehouseItemsTable.findFirst as vi.Mock).mockResolvedValue(
        existingWarehouseItem
      );
      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedWarehouseItem]),
      });
      (db.insert as vi.Mock).mockImplementation((table) => {
        if (table === transactionsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([createdTransaction]),
          };
        } else if (table === productSuppliersTable) {
          return {
            values: vi.fn().mockReturnThis(),
          };
        }
        return {};
      });

      const result = await create_with_warehouse_item(newTransactionData);
      expect(result).toEqual({ data: createdTransaction, error: null });
      expect(db.update).toHaveBeenCalledWith(warehouseItemsTable);
      expect(db.insert).toHaveBeenCalledWith(transactionsTable);
      expect(db.insert).toHaveBeenCalledWith(productSuppliersTable);
    });

    it("should return MISSING_INPUT if required fields are missing", async () => {
      let result = await create_with_warehouse_item({
        ...mockTransaction,
        productId: "",
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create_with_warehouse_item({
        ...mockTransaction,
        type: undefined as any,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create_with_warehouse_item({
        ...mockTransaction,
        quantity: undefined as any,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create_with_warehouse_item({
        ...mockTransaction,
        businessId: "",
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.warehouseItemsTable.findFirst as vi.Mock).mockImplementation(
        () => {
          throw new Error("DB error");
        }
      );

      const result = await create_with_warehouse_item(mockTransaction);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_by_type", () => {
    it("should return transactions by type", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([mockTransaction]),
      });

      const result = await get_by_type(mockBusinessId, "SALE");
      expect(result).toEqual({ data: [mockTransaction], error: null });
      expect(db.select().from().where).toHaveBeenCalledWith(
        and(
          eq(transactionsTable.businessId, mockBusinessId),
          eq(transactionsTable.type, "SALE")
        )
      );
    });

    it("should return MISSING_INPUT if businessId or type is missing", async () => {
      let result = await get_by_type("", "SALE");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await get_by_type(mockBusinessId, undefined as any);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_by_type(mockBusinessId, "SALE");
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
