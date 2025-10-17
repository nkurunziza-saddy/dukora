import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { ErrorCode } from "@/server/constants/errors";
import { syncMetricsToDatabase } from "@/server/helpers/db-functional-helpers";

// Mock the metrics repo
vi.mock("@/server/repos/metrics-repo");

import * as metricsRepo from "@/server/repos/metrics-repo";

describe("DB Functional Helpers", () => {
  const mockBusinessId = "biz-1";
  const mockDate = new Date("2024-07-01");
  const mockMetrics = {
    grossRevenue: 1000,
    // returns,
    // returnRate,
    // uniqueProductsSold,
    // averageQuantityPerTransaction
    // openingStock
    // closingStock
    //     purchases
    //     purchaseReturns
    //     purchaseReturnRate,
    //     costOfGoodsSold
    //     averageInventory
    //     daysOnHand,
    //     inventoryValue,
    //     inventoryGrowth,
    //     operatingExpenses
    //     expenseRatio,

    //     assetTurnover,
    //     workingCapital
    netRevenue: 900,
    grossProfit: 400,
    operatingIncome: -100,
    netIncome: -100,
    transactionCount: 5,
    averageOrderValue: 200,
    inventoryTurnover: 2.5,
    grossMargin: 44.44,
    dataQuality: {
      totalTransactions: 10,
      validTransactions: 8,
      hasInventoryData: true,
      hasExpenseData: true,
      calculationDate: "2024-08-14T01:41:01.000Z",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("syncMetricsToDatabase", () => {
    it("should sync all metrics successfully using upsert", async () => {
      (metricsRepo.upsert_metric as Mock).mockResolvedValue({
        data: { id: "metric-1" },
        error: null,
      });

      const result = await syncMetricsToDatabase(
        mockBusinessId,
        mockDate,
        mockMetrics,
      );

      expect(result.error).toBeNull();
      expect(result.data?.successful).toHaveLength(9); // All metrics except dataQuality
      expect(result.data?.failed).toHaveLength(0);
      expect(metricsRepo.upsert_metric).toHaveBeenCalledTimes(9);
    });

    it("should validate input parameters", async () => {
      // @ts-expect-error - Testing invalid input
      const result1 = await syncMetricsToDatabase(null, mockDate, mockMetrics);
      expect(result1.error).toBe(ErrorCode.BAD_REQUEST);

      // @ts-expect-error - Testing invalid input
      const result2 = await syncMetricsToDatabase(
        mockBusinessId,
        null,
        mockMetrics,
      );
      expect(result2.error).toBe(ErrorCode.BAD_REQUEST);

      // @ts-expect-error - Testing invalid input
      const result3 = await syncMetricsToDatabase(
        mockBusinessId,
        mockDate,
        null,
      );
      expect(result3.error).toBe(ErrorCode.BAD_REQUEST);
    });

    it("should skip dataQuality object from syncing", async () => {
      (metricsRepo.upsert_metric as Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      await syncMetricsToDatabase(mockBusinessId, mockDate, mockMetrics);

      const calls = (metricsRepo.upsert_metric as Mock).mock.calls;
      const metricNames = calls.map((call) => call[0].name);
      expect(metricNames).not.toContain("dataQuality");
    });

    it("should handle partial failures gracefully", async () => {
      (metricsRepo.upsert_metric as Mock)
        .mockResolvedValueOnce({ data: { id: "metric-1" }, error: null })
        .mockResolvedValueOnce({ data: null, error: ErrorCode.DATABASE_ERROR })
        .mockResolvedValueOnce({ data: { id: "metric-3" }, error: null });

      const result = await syncMetricsToDatabase(mockBusinessId, mockDate, {
        grossRevenue: 1000,
        netRevenue: 900,
        grossProfit: 400,
      });

      expect(result.error).toBe(ErrorCode.PARTIAL_SUCCESS);
      expect(result.data?.successful).toHaveLength(2);
      expect(result.data?.failed).toHaveLength(1);
    });

    it("should skip invalid metric values like null, undefined, or NaN", async () => {
      const metricsWithInvalidValues = {
        grossRevenue: 1000,
        netRevenue: null,
        grossProfit: undefined,
        operatingIncome: NaN,
        transactionCount: 5,
      };

      (metricsRepo.upsert_metric as Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      await syncMetricsToDatabase(
        mockBusinessId,
        mockDate,
        metricsWithInvalidValues,
      );

      const calls = (metricsRepo.upsert_metric as Mock).mock.calls;
      expect(calls).toHaveLength(2); // grossRevenue and transactionCount only
      const metricNames = calls.map((call) => call[0].name);
      expect(metricNames).toEqual(["grossRevenue", "transactionCount"]);
    });

    it("should handle different value types by converting them to strings", async () => {
      const metricsWithDifferentTypes = {
        grossRevenue: 1000.5,
        netRevenue: "900",
        hasData: true,
        metadata: { key: "value" },
      };

      (metricsRepo.upsert_metric as Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      await syncMetricsToDatabase(
        mockBusinessId,
        mockDate,
        metricsWithDifferentTypes,
      );

      const calls = (metricsRepo.upsert_metric as Mock).mock.calls;
      const passedMetrics = Object.fromEntries(
        calls.map((call) => [call[0].name, call[0].value]),
      );

      expect(passedMetrics.grossRevenue).toBe("1000.5");
      expect(passedMetrics.netRevenue).toBe("900");
      expect(passedMetrics.hasData).toBe("true");
      expect(passedMetrics.metadata).toBe('{"key":"value"}');
    });

    it("should handle database exceptions for individual metrics", async () => {
      (metricsRepo.upsert_metric as Mock)
        .mockResolvedValueOnce({ data: { id: "metric-1" }, error: null })
        .mockRejectedValueOnce(new Error("Database connection failed"));

      const result = await syncMetricsToDatabase(mockBusinessId, mockDate, {
        grossRevenue: 1000,
        netRevenue: 900,
      });

      expect(result.error).toBe(ErrorCode.PARTIAL_SUCCESS);
      expect(result.data?.successful).toHaveLength(1);
      expect(result.data?.failed).toHaveLength(1);
      expect(result.data?.failed[0]).toMatchObject({ metric: "netRevenue" });
    });

    it("should return database error when all metrics fail", async () => {
      (metricsRepo.upsert_metric as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await syncMetricsToDatabase(mockBusinessId, mockDate, {
        grossRevenue: 1000,
      });

      expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
      expect(result.data).toBeNull();
    });

    it("should call upsert_metric with correct parameters", async () => {
      (metricsRepo.upsert_metric as Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      await syncMetricsToDatabase(mockBusinessId, mockDate, {
        grossRevenue: 1000,
      });

      expect(metricsRepo.upsert_metric).toHaveBeenCalledWith({
        businessId: mockBusinessId,
        name: "grossRevenue",
        periodType: "monthly",
        period: mockDate,
        value: "1000",
      });
    });
  });
});
