import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { metricsTable, businessesTable } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  insert_metric,
  upsert_metric,
  get_metric,
  get_metric_by_name,
  get_monthly_metrics,
  get_metrics_history,
  delete_metrics_for_period,
  get_latest_metrics,
  bulk_insert_metrics,
} from "@/server/repos/metrics-repo";

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
        onConflictDoUpdate: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(),
          orderBy: vi.fn(),
        })),
      })),
    })),
    query: {
      metricsTable: {
        findFirst: vi.fn(),
      },
      businessesTable: {
        findFirst: vi.fn(),
      },
    },
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  },
}));

describe("Metrics Repo", () => {
  const mockMetric = {
    businessId: "biz1",
    name: "grossRevenue",
    periodType: "monthly",
    period: new Date("2024-01-01"),
    value: "1000",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("insert_metric", () => {
    it("should insert a new metric", async () => {
      (db.query.metricsTable.findFirst as vi.Mock).mockResolvedValue(null);
      (db.insert as vi.Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockMetric]),
      });

      const result = await insert_metric(mockMetric);
      expect(result).toEqual({ data: mockMetric, error: null });
      expect(db.insert).toHaveBeenCalledWith(metricsTable);
    });

    it("should return ALREADY_EXISTS if metric already exists", async () => {
      (db.query.metricsTable.findFirst as vi.Mock).mockResolvedValue(
        mockMetric
      );

      const result = await insert_metric(mockMetric);
      expect(result).toEqual({ data: null, error: ErrorCode.ALREADY_EXISTS });
      expect(db.insert).not.toHaveBeenCalled();
    });

    it("should return DATABASE_ERROR on failure", async () => {
      (db.query.metricsTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await insert_metric(mockMetric);
      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("upsert_metric", () => {
    it("should upsert a metric", async () => {
      (db.insert as vi.Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockMetric]),
      });

      const result = await upsert_metric(mockMetric);
      expect(result).toEqual({ data: mockMetric, error: null });
      expect(db.insert).toHaveBeenCalledWith(metricsTable);
    });

    it("should return DATABASE_ERROR on failure", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await upsert_metric(mockMetric);
      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("get_metric", () => {
    it("should return a metric if found", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMetric]),
      });

      const result = await get_metric(
        mockMetric.businessId,
        mockMetric.periodType,
        mockMetric.period
      );
      expect(result).toEqual({ data: mockMetric, error: null });
      expect(db.select).toHaveBeenCalledWith();
      expect(db.select().from).toHaveBeenCalledWith(metricsTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        and(
          eq(metricsTable.businessId, mockMetric.businessId),
          eq(metricsTable.periodType, mockMetric.periodType),
          eq(metricsTable.period, mockMetric.period)
        )
      );
    });

    it("should return null if metric not found", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await get_metric(
        mockMetric.businessId,
        mockMetric.periodType,
        mockMetric.period
      );
      expect(result).toEqual({ data: null, error: null });
    });

    it("should return DATABASE_ERROR on failure", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_metric(
        mockMetric.businessId,
        mockMetric.periodType,
        mockMetric.period
      );
      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("get_metric_by_name", () => {
    it("should return a metric by name if found", async () => {
      (db.query.businessesTable.findFirst as vi.Mock).mockResolvedValue({
        id: mockMetric.businessId,
      });
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMetric]),
      });

      const result = await get_metric_by_name(
        mockMetric.businessId,
        mockMetric.name,
        mockMetric.periodType,
        mockMetric.period
      );
      expect(result).toEqual({ data: mockMetric, error: null });
      expect(db.select).toHaveBeenCalledWith();
      expect(db.select().from).toHaveBeenCalledWith(metricsTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        and(
          eq(metricsTable.businessId, mockMetric.businessId),
          eq(metricsTable.name, mockMetric.name),
          eq(metricsTable.periodType, mockMetric.periodType),
          eq(metricsTable.period, mockMetric.period)
        )
      );
    });

    it("should return BUSINESS_NOT_FOUND if business does not exist", async () => {
      (db.query.businessesTable.findFirst as vi.Mock).mockResolvedValue(null);

      const result = await get_metric_by_name(
        mockMetric.businessId,
        mockMetric.name,
        mockMetric.periodType,
        mockMetric.period
      );
      expect(result).toEqual({
        data: null,
        error: ErrorCode.BUSINESS_NOT_FOUND,
      });
    });

    it("should return NOT_FOUND if metric not found", async () => {
      (db.query.businessesTable.findFirst as vi.Mock).mockResolvedValue({
        id: mockMetric.businessId,
      });
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await get_metric_by_name(
        mockMetric.businessId,
        mockMetric.name,
        mockMetric.periodType,
        mockMetric.period
      );
      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });

    it("should return DATABASE_ERROR on failure", async () => {
      (db.query.businessesTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await get_metric_by_name(
        mockMetric.businessId,
        mockMetric.name,
        mockMetric.periodType,
        mockMetric.period
      );
      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("get_monthly_metrics", () => {
    it("should return monthly metrics as an object", async () => {
      const mockMetricsList = [
        {
          name: "grossRevenue",
          value: "1000",
          period: mockMetric.period,
          periodType: "monthly",
          businessId: mockMetric.businessId,
        },
        {
          name: "netRevenue",
          value: "900",
          period: mockMetric.period,
          periodType: "monthly",
          businessId: mockMetric.businessId,
        },
      ];
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockMetricsList),
      });

      const result = await get_monthly_metrics(
        mockMetric.businessId,
        mockMetric.period
      );
      expect(result).toEqual({
        data: { grossRevenue: 1000, netRevenue: 900 },
        error: null,
      });
    });

    it("should return empty object if no metrics found", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      });

      const result = await get_monthly_metrics(
        mockMetric.businessId,
        mockMetric.period
      );
      expect(result).toEqual({ data: {}, error: null });
    });

    it("should return DATABASE_ERROR on failure", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_monthly_metrics(
        mockMetric.businessId,
        mockMetric.period
      );
      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("get_metrics_history", () => {
    it("should return metrics history grouped by period", async () => {
      const mockHistory = [
        {
          name: "grossRevenue",
          value: "1000",
          period: new Date("2024-01-01"),
          periodType: "monthly",
          businessId: mockMetric.businessId,
        },
        {
          name: "netRevenue",
          value: "900",
          period: new Date("2024-01-01"),
          periodType: "monthly",
          businessId: mockMetric.businessId,
        },
        {
          name: "grossRevenue",
          value: "1100",
          period: new Date("2023-12-01"),
          periodType: "monthly",
          businessId: mockMetric.businessId,
        },
      ];
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockHistory),
      });

      const result = await get_metrics_history(mockMetric.businessId, [
        "grossRevenue",
        "netRevenue",
      ]);
      expect(result).toEqual({
        data: {
          "2024-01": { grossRevenue: 1000, netRevenue: 900 },
          "2023-12": { grossRevenue: 1100 },
        },
        error: null,
      });
    });

    it("should return empty object if no history found", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await get_metrics_history(mockMetric.businessId, [
        "grossRevenue",
      ]);
      expect(result).toEqual({ data: {}, error: null });
    });

    it("should return DATABASE_ERROR on failure", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_metrics_history(mockMetric.businessId, [
        "grossRevenue",
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("delete_metrics_for_period", () => {
    it("should delete metrics for a given period", async () => {
      (db.delete as vi.Mock).mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      });

      const result = await delete_metrics_for_period(
        mockMetric.businessId,
        mockMetric.periodType,
        mockMetric.period
      );
      expect(result).toEqual({ data: {}, error: null });
      expect(db.delete).toHaveBeenCalledWith(metricsTable);
      expect(db.delete().where).toHaveBeenCalledWith(
        and(
          eq(metricsTable.businessId, mockMetric.businessId),
          eq(metricsTable.periodType, mockMetric.periodType),
          eq(metricsTable.period, mockMetric.period)
        )
      );
    });

    it("should return DATABASE_ERROR on failure", async () => {
      (db.delete as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await delete_metrics_for_period(
        mockMetric.businessId,
        mockMetric.periodType,
        mockMetric.period
      );
      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("get_latest_metrics", () => {
    it("should return the latest metrics for specified names", async () => {
      const mockLatestMetrics = [
        {
          name: "grossRevenue",
          value: "1200",
          period: new Date("2024-02-01"),
          periodType: "monthly",
          businessId: mockMetric.businessId,
        },
        {
          name: "netRevenue",
          value: "1100",
          period: new Date("2024-02-01"),
          periodType: "monthly",
          businessId: mockMetric.businessId,
        },
        {
          name: "grossRevenue",
          value: "1000",
          period: new Date("2024-01-01"),
          periodType: "monthly",
          businessId: mockMetric.businessId,
        },
      ];
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockLatestMetrics),
      });

      const result = await get_latest_metrics(mockMetric.businessId, [
        "grossRevenue",
        "netRevenue",
      ]);
      expect(result).toEqual({
        data: { grossRevenue: 1200, netRevenue: 1100 },
        error: null,
      });
    });

    it("should return empty object if no latest metrics found", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await get_latest_metrics(mockMetric.businessId, [
        "grossRevenue",
      ]);
      expect(result).toEqual({ data: {}, error: null });
    });

    it("should return DATABASE_ERROR on failure", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_latest_metrics(mockMetric.businessId, [
        "grossRevenue",
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("bulk_insert_metrics", () => {
    it("should bulk insert metrics", async () => {
      const mockMetrics = [
        mockMetric,
        { ...mockMetric, name: "netProfit", value: "400" },
      ];
      (db.insert as vi.Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(mockMetrics),
      });

      const result = await bulk_insert_metrics(mockMetrics);
      expect(result).toEqual({ data: mockMetrics, error: null });
      expect(db.insert).toHaveBeenCalledWith(metricsTable);
      expect(db.insert().values).toHaveBeenCalledWith(mockMetrics);
    });

    it("should return DATABASE_ERROR on failure", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await bulk_insert_metrics([mockMetric]);
      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });
});
