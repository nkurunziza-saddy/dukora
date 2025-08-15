import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import {
  calculateAndSyncMonthlyMetrics,
  getMonthlyMetrics,
} from "@/server/actions/metrics-action";
import { startOfMonth, subMonths } from "date-fns";
import { ErrorCode } from "@/server/constants/errors";

import { getCurrentSession } from "@/server/actions/auth-actions";

vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/helpers/role-permissions");
vi.mock("@/server/repos/transaction-repo");
vi.mock("@/server/repos/metrics-repo");
vi.mock("@/server/actions/warehouse-item-actions");
vi.mock("@/server/actions/expense-actions");
vi.mock("@/server/helpers/db-functional-helpers");
vi.mock("@/server/helpers/accounting-formulas");

import * as rolePermissions from "@/server/helpers/role-permissions";
import * as transactionRepo from "@/server/repos/transaction-repo";
import * as metricsRepo from "@/server/repos/metrics-repo";
import { getWarehouseItemsByBusiness } from "@/server/actions/warehouse-item-actions";
import { getExpensesByTimeInterval } from "@/server/actions/expense-actions";
import { syncMetricsToDatabase } from "@/server/helpers/db-functional-helpers";
import {
  calculateAllMetrics,
  calculateClosingStock,
} from "@/server/helpers/accounting-formulas";

describe("Metrics Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    createdAt: new Date("2024-01-01"),
    email: "test@example.com",
    name: "Test User",
  };

  const mockTransactions = {
    data: [
      {
        transactions: {
          id: "trans-1",
          type: "SALE",
          quantity: 10,
          productId: "prod-1",
        },
        products: {
          id: "prod-1",
          name: "Test Product",
          price: "100.00",
          costPrice: "60.00",
        },
      },
    ],
    error: null,
  };

  const mockExpenses = {
    data: [
      {
        id: "exp-1",
        amount: "500.00",
        businessId: "biz-1",
      },
    ],
    error: null,
  };

  const mockWarehouseItems = {
    data: [
      {
        id: "whi-1",
        quantity: 50,
        product: {
          costPrice: "60.00",
        },
      },
    ],
    error: null,
  };

  const mockCalculatedMetrics = {
    grossRevenue: 1000,
    netRevenue: 1000,
    grossProfit: 400,
    operatingIncome: -100,
    netIncome: -100,
    transactionCount: 1,
    dataQuality: {
      totalTransactions: 1,
      validTransactions: 1,
      hasInventoryData: true,
      hasExpenseData: true,
      calculationDate: new Date().toISOString(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (getCurrentSession as vi.Mock).mockResolvedValue({
      user: mockUser,
    });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
    (transactionRepo.get_by_time_interval as Mock).mockResolvedValue(
      mockTransactions
    );
    (getExpensesByTimeInterval as Mock).mockResolvedValue(mockExpenses);
    (getWarehouseItemsByBusiness as Mock).mockResolvedValue(mockWarehouseItems);
    (calculateClosingStock as Mock).mockReturnValue(3000);
    (calculateAllMetrics as Mock).mockReturnValue(mockCalculatedMetrics);
    (syncMetricsToDatabase as Mock).mockResolvedValue({
      data: [],
      error: null,
    });
    (metricsRepo.get_metric_by_name as Mock).mockResolvedValue({
      data: { value: "2000" },
      error: null,
    });
  });

  describe("calculateAndSyncMonthlyMetrics", () => {
    it("should calculate and sync metrics successfully", async () => {
      const testDate = startOfMonth(subMonths(new Date(), 2));
      const result = await calculateAndSyncMonthlyMetrics(testDate);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockCalculatedMetrics);
      expect(calculateAllMetrics).toHaveBeenCalledWith(
        expect.any(Array),
        mockExpenses.data,
        2000, // opening stock
        3000 // closing stock
      );
      expect(syncMetricsToDatabase).toHaveBeenCalledWith(
        "biz-1",
        testDate,
        mockCalculatedMetrics
      );
    });

    it("should return unauthorized error when user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const testDate = startOfMonth(subMonths(new Date(), 2));
      const result = await calculateAndSyncMonthlyMetrics(testDate);

      expect(result.error).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.data).toBeNull();
    });

    it("should reject invalid date input", async () => {
      const invalidDate = new Date("invalid");
      const result = await calculateAndSyncMonthlyMetrics(invalidDate);

      expect(result.error).toBe(ErrorCode.BAD_REQUEST);
      expect(result.data).toBeNull();
    });

    it("should reject current month date", async () => {
      const currentMonth = startOfMonth(new Date());
      const result = await calculateAndSyncMonthlyMetrics(currentMonth);

      expect(result.error).toBe(ErrorCode.BAD_REQUEST);
      expect(result.data).toBeNull();
    });

    it("should reject dates before business creation", async () => {
      const beforeBusinessDate = new Date("2023-12-01");
      const result = await calculateAndSyncMonthlyMetrics(beforeBusinessDate);

      expect(result.error).toBe(ErrorCode.BAD_REQUEST);
      expect(result.data).toBeNull();
    });

    it("should handle transaction fetch errors", async () => {
      (transactionRepo.get_by_time_interval as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const testDate = startOfMonth(subMonths(new Date(), 2));
      const result = await calculateAndSyncMonthlyMetrics(testDate);

      expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
      expect(result.data).toBeNull();
    });

    it("should handle warehouse items fetch errors", async () => {
      (getWarehouseItemsByBusiness as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const testDate = startOfMonth(subMonths(new Date(), 2));
      const result = await calculateAndSyncMonthlyMetrics(testDate);

      expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
      expect(result.data).toBeNull();
    });

    it("should handle expenses fetch errors", async () => {
      (getExpensesByTimeInterval as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const testDate = startOfMonth(subMonths(new Date(), 2));
      const result = await calculateAndSyncMonthlyMetrics(testDate);

      expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
      expect(result.data).toBeNull();
    });

    it("should filter out invalid transactions", async () => {
      const transactionsWithInvalid = {
        data: [
          {
            transactions: {
              id: "trans-1",
              type: "SALE",
              quantity: 10,
              productId: "prod-1",
            },
            products: {
              id: "prod-1",
              name: "Test Product",
              price: "100.00",
              costPrice: "60.00",
            },
          },
          {
            transactions: {
              id: "trans-2",
              type: "SALE",
              quantity: 5,
              productId: "prod-2",
            },
            products: null, // Invalid product
          },
        ],
        error: null,
      };

      (transactionRepo.get_by_time_interval as Mock).mockResolvedValue(
        transactionsWithInvalid
      );

      const testDate = startOfMonth(subMonths(new Date(), 2));
      await calculateAndSyncMonthlyMetrics(testDate);

      // Should only pass valid transactions to calculateAllMetrics
      expect(calculateAllMetrics).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "trans-1",
            product: expect.objectContaining({ id: "prod-1" }),
          }),
        ]),
        expect.any(Array),
        expect.any(Number),
        expect.any(Number)
      );

      // Should not include the invalid transaction
      const calledTransactions = (calculateAllMetrics as Mock).mock.calls[0][0];
      expect(calledTransactions).toHaveLength(1);
    });

    it("should handle sync errors gracefully", async () => {
      (syncMetricsToDatabase as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const testDate = startOfMonth(subMonths(new Date(), 2));
      const result = await calculateAndSyncMonthlyMetrics(testDate);

      // Should return calculated metrics even if sync fails
      expect(result.data).toEqual(mockCalculatedMetrics);
      expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
    });

    it("should use zero opening stock when previous month metric not found", async () => {
      (metricsRepo.get_metric_by_name as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.NOT_FOUND,
      });

      const testDate = startOfMonth(subMonths(new Date(), 2));
      await calculateAndSyncMonthlyMetrics(testDate);

      expect(calculateAllMetrics).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Array),
        0, // should default to 0 for opening stock
        3000
      );
    });

    it("should handle exceptions gracefully", async () => {
      (transactionRepo.get_by_time_interval as Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const testDate = startOfMonth(subMonths(new Date(), 2));
      const result = await calculateAndSyncMonthlyMetrics(testDate);

      expect(result.error).toBe(ErrorCode.FAILED_REQUEST);
      expect(result.data).toBeNull();
    });
  });

  describe("getMonthlyMetrics", () => {
    it("should retrieve monthly metrics successfully", async () => {
      const mockMetrics = {
        data: [
          { name: "grossRevenue", value: "1000" },
          { name: "netRevenue", value: "900" },
        ],
        error: null,
      };

      (metricsRepo.get_monthly_metrics as Mock).mockResolvedValue(mockMetrics);

      const testDate = startOfMonth(subMonths(new Date(), 1));
      const result = await getMonthlyMetrics(testDate);

      expect(result).toEqual(mockMetrics);
      expect(metricsRepo.get_monthly_metrics).toHaveBeenCalledWith(
        "biz-1",
        testDate
      );
    });

    it("should return unauthorized error when user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const testDate = startOfMonth(subMonths(new Date(), 1));
      const result = await getMonthlyMetrics(testDate);

      expect(result.error).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.data).toBeNull();
    });

    it("should handle database errors", async () => {
      (metricsRepo.get_monthly_metrics as Mock).mockRejectedValue(
        new Error("Database error")
      );

      const testDate = startOfMonth(subMonths(new Date(), 1));
      const result = await getMonthlyMetrics(testDate);

      expect(result.error).toBe(ErrorCode.FAILED_REQUEST);
      expect(result.data).toBeNull();
    });
  });
});
