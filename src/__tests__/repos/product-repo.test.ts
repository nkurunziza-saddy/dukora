import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { productsTable, auditLogsTable } from "@/lib/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  get_all,
  get_overview,
  get_by_id,
  create,
  update,
  remove,
  create_many,
} from "@/server/repos/product-repo";

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
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      then: (onfulfilled) => onfulfilled([]),
    })),
    query: {
      productsTable: {
        findFirst: vi.fn(),
      },
    },
    transaction: vi.fn((callback) => callback(db)),
  },
}));

describe("Product Repo", () => {
  const mockBusinessId = "biz1";
  const mockUserId = "user1";
  const mockProduct = {
    id: "prod1",
    name: "Test Product",
    sku: "TP001",
    businessId: mockBusinessId,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get_all", () => {
    it("should return all products for a business", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([mockProduct]),
      });

      const result = await get_all(mockBusinessId);
      expect(result).toEqual({ data: [mockProduct], error: null });
      expect(db.select).toHaveBeenCalledWith();
      expect(db.select().from).toHaveBeenCalledWith(productsTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        and(
          eq(productsTable.businessId, mockBusinessId),
          isNull(productsTable.deletedAt)
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

  describe("get_overview", () => {
    it("should return product overview with limit", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockProduct]),
      });

      const result = await get_overview(mockBusinessId, 5);
      expect(result).toEqual({ data: [mockProduct], error: null });
      expect(db.select().from().where().orderBy().limit).toHaveBeenCalledWith(
        5
      );
    });

    it("should return product overview without limit", async () => {
      const mockThen = (onfulfilled) => onfulfilled([mockProduct]);
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ then: mockThen }),
        then: mockThen,
      };
      (db.select as vi.Mock).mockReturnValue(mockQuery);

      const result = await get_overview(mockBusinessId);
      expect(result).toEqual({ data: [mockProduct], error: null });
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await get_overview("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_overview(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_by_id", () => {
    it("should return a product by ID", async () => {
      (db.query.productsTable.findFirst as vi.Mock).mockResolvedValue(
        mockProduct
      );

      const result = await get_by_id(mockProduct.id, mockBusinessId);
      expect(result).toEqual({ data: mockProduct, error: null });
      expect(db.query.productsTable.findFirst).toHaveBeenCalledWith({
        where: and(
          eq(productsTable.id, mockProduct.id),
          eq(productsTable.businessId, mockBusinessId)
        ),
        with: expect.any(Object),
      });
    });

    it("should return MISSING_INPUT if productId or businessId is missing", async () => {
      let result = await get_by_id("", mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await get_by_id(mockProduct.id, "");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return PRODUCT_NOT_FOUND if product is not found", async () => {
      (db.query.productsTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );

      const result = await get_by_id(mockProduct.id, mockBusinessId);
      expect(result).toEqual({
        data: null,
        error: ErrorCode.PRODUCT_NOT_FOUND,
      });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.productsTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await get_by_id(mockProduct.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create", () => {
    it("should create a new product and audit log", async () => {
      const newProductData = {
        name: "New Product",
        sku: "NP001",
        businessId: mockBusinessId,
      };
      const createdProduct = { id: "newProd", ...newProductData };

      (db.insert as vi.Mock).mockImplementation((table) => {
        if (table === productsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([createdProduct]),
          };
        } else if (table === auditLogsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{}]),
          };
        }
        return {};
      });

      const result = await create(newProductData, mockUserId);
      expect(result).toEqual({ data: createdProduct, error: null });
      expect(db.insert).toHaveBeenCalledWith(productsTable);
      expect(db.insert).toHaveBeenCalledWith(auditLogsTable);
    });

    it("should return MISSING_INPUT if product name or businessId is missing", async () => {
      let result = await create(
        { name: "", sku: "NP001", businessId: mockBusinessId },
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create(
        { name: "New Product", sku: "NP001", businessId: "" },
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await create(
        { name: "New Product", sku: "NP001", businessId: mockBusinessId },
        mockUserId
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("update", () => {
    it("should update an existing product and audit log", async () => {
      const updates = { name: "Updated Product Name" };
      const updatedProduct = { ...mockProduct, ...updates };

      (db.transaction as vi.Mock).mockImplementation(async (callback) => {
        const updatedProduct = { ...mockProduct, ...updates };
        (db.update as vi.Mock).mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([updatedProduct]),
        });
        (db.insert as vi.Mock).mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([{}]),
        });

        return callback(db);
      });

      const result = await update(
        mockProduct.id,
        mockBusinessId,
        mockUserId,
        updates
      );
      expect(result).toEqual({
        data: { ...mockProduct, ...updates },
        error: null,
      });
    });

    it("should return MISSING_INPUT if productId or businessId is missing", async () => {
      let result = await update("", mockBusinessId, mockUserId, {});
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await update(mockProduct.id, "", mockUserId, {});
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return PRODUCT_NOT_FOUND if product to update is not found", async () => {
      (db.transaction as vi.Mock).mockImplementation(async (callback) => {
        (db.update as vi.Mock).mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([]),
        });
        return callback(db);
      });

      const result = await update(
        mockProduct.id,
        mockBusinessId,
        mockUserId,
        {}
      );
      expect(result).toEqual({
        data: null,
        error: ErrorCode.PRODUCT_NOT_FOUND,
      });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.transaction as vi.Mock).mockImplementation(async (callback) => {
        (db.update as vi.Mock).mockImplementation(() => {
          throw new Error("DB error");
        });
        return callback(db);
      });

      const result = await update(
        mockProduct.id,
        mockBusinessId,
        mockUserId,
        {}
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("remove", () => {
    it("should soft delete a product and create audit log", async () => {
      (db.query.productsTable.findFirst as vi.Mock).mockResolvedValue(
        mockProduct
      );
      (db.transaction as vi.Mock).mockImplementation(async (callback) => {
        (db.update as vi.Mock).mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockProduct]),
        });
        (db.insert as vi.Mock).mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([{}]),
        });

        return callback(db);
      });

      const result = await remove(mockProduct.id, mockBusinessId, mockUserId);
      expect(result).toEqual({ data: mockProduct, error: null });
    });

    it("should return MISSING_INPUT if productId or businessId is missing", async () => {
      let result = await remove("", mockBusinessId, mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await remove(mockProduct.id, "", mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return PRODUCT_NOT_FOUND if product to delete is not found", async () => {
      (db.query.productsTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );

      const result = await remove(mockProduct.id, mockBusinessId, mockUserId);
      expect(result).toEqual({
        data: null,
        error: ErrorCode.PRODUCT_NOT_FOUND,
      });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.productsTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await remove(mockProduct.id, mockBusinessId, mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create_many", () => {
    it("should create multiple products", async () => {
      const newProductsData = [
        { name: "Prod A", sku: "PA", businessId: mockBusinessId },
        { name: "Prod B", sku: "PB", businessId: mockBusinessId },
      ];
      (db.insert as vi.Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(newProductsData),
      });

      const result = await create_many(newProductsData);
      expect(result).toEqual({ data: newProductsData, error: null });
      expect(db.insert).toHaveBeenCalledWith(productsTable);
      expect(db.insert().values).toHaveBeenCalledWith(newProductsData);
    });

    it("should return MISSING_INPUT if products array is empty", async () => {
      const result = await create_many([]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return MISSING_INPUT if businessId is inconsistent or missing", async () => {
      let result = await create_many([
        { name: "Prod A", sku: "PA", businessId: "" },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create_many([
        { name: "Prod A", sku: "PA", businessId: mockBusinessId },
        { name: "Prod B", sku: "PB", businessId: "anotherBiz" },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await create_many([
        { name: "Prod A", sku: "PA", businessId: mockBusinessId },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
