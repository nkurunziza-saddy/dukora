import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  transactionsTable,
  productsTable,
  expensesTable,
  usersTable,
} from "@/lib/schema";
import { and, eq, gte, lte, desc, asc } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  getTransactionMetricsForInterval,
  getFilteredTransactions,
} from "@/server/repos/statistics/transactions-stat-repo";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            innerJoin: vi.fn(() => ({
              orderBy: vi.fn(() => ({
                limit: vi.fn(() => ({
                  offset: vi.fn(),
                })),
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

describe("Transaction Statistics Repo", () => {
  const mockBusinessId = "biz1";
  const mockUserId = "user1";
  const mockProductId = "prod1";
  const mockTransaction = {
    id: "trans1",
    businessId: mockBusinessId,
    productId: mockProductId,
    type: "SALE",
    quantity: 10,
    price: "100.00",
    createdAt: new Date("2024-01-15"),
  };
  const mockExpense = {
    id: "exp1",
    businessId: mockBusinessId,
    amount: "50.00",
    note: "Office Supplies",
    createdAt: new Date("2024-01-10"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTransactionMetricsForInterval", () => {
    it("should return transaction metrics for a given interval", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      (db.select as vi.Mock).mockImplementation((columns) => {
        if (columns.type === transactionsTable.type) {
          return {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockResolvedValue([mockTransaction]),
          };
        } else if (columns.amount === expensesTable.amount) {
          return {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([mockExpense]),
          };
        }
        return {};
      });

      const result = await getTransactionMetricsForInterval(
        mockBusinessId,
        startDate,
        endDate
      );

      expect(result).toEqual({
        data: {
          totalSales: 1000, // 10 * 100
          totalExpenses: 50, // from mockExpense
          netProfit: 950,
          transactionCount: 2,
        },
        error: null,
      });
    });

    it("should handle no transactions or expenses", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      (db.select as vi.Mock).mockImplementation((columns) => {
        if (columns.type === transactionsTable.type) {
          return {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockResolvedValue([]),
          };
        } else if (columns.amount === expensesTable.amount) {
          return {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([]),
          };
        }
        return {};
      });

      const result = await getTransactionMetricsForInterval(
        mockBusinessId,
        startDate,
        endDate
      );

      expect(result).toEqual({
        data: {
          totalSales: 0,
          totalExpenses: 0,
          netProfit: 0,
          transactionCount: 0,
        },
        error: null,
      });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getTransactionMetricsForInterval(
        mockBusinessId,
        new Date(),
        new Date()
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("getFilteredTransactions", () => {
    it("should return filtered transactions", async () => {
      const mockFilteredTransactions = [
        { ...mockTransaction, createdBy: mockUserId },
      ];
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockFilteredTransactions),
      });

      const result = await getFilteredTransactions(
        mockBusinessId,
        10,
        0,
        "createdAt",
        "desc",
        "SALE",
        new Date("2024-01-01").toISOString(),
        new Date("2024-01-31").toISOString()
      );

      expect(result).toEqual({ data: mockFilteredTransactions, error: null });
      expect(db.select().from().innerJoin().where).toHaveBeenCalledWith(
        and(
          eq(transactionsTable.businessId, mockBusinessId),
          eq(transactionsTable.type, "SALE"),
          gte(transactionsTable.createdAt, expect.any(String)),
          lte(transactionsTable.createdAt, expect.any(String))
        )
      );
      expect(
        db.select().from().innerJoin().where().orderBy
      ).toHaveBeenCalledWith(desc(transactionsTable.createdAt));
      expect(
        db.select().from().innerJoin().where().orderBy().limit
      ).toHaveBeenCalledWith(10);
      expect(
        db.select().from().innerJoin().where().orderBy().limit().offset
      ).toHaveBeenCalledWith(0);
    });

    it("should handle no filters", async () => {
      const mockFilteredTransactions = [
        { ...mockTransaction, createdBy: mockUserId },
      ];
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockFilteredTransactions),
      });

      const result = await getFilteredTransactions(
        mockBusinessId,
        10,
        0,
        "createdAt",
        "desc"
      );

      expect(result).toEqual({ data: mockFilteredTransactions, error: null });
      expect(db.select().from().innerJoin().where).toHaveBeenCalledWith(
        and(eq(transactionsTable.businessId, mockBusinessId))
      );
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getFilteredTransactions(
        mockBusinessId,
        10,
        0,
        "createdAt",
        "desc"
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
