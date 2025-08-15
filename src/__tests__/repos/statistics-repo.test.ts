import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { transactionsTable, auditLogsTable, usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  get_transactions,
  get_audit_logs,
} from "@/server/repos/statistics-repo";

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      transactionsTable: {
        findMany: vi.fn(),
      },
      auditLogsTable: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe("Statistics Repo", () => {
  const mockBusinessId = "biz1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get_transactions", () => {
    it("should return transactions for a business", async () => {
      const mockTransactions = [
        { id: "trans1", businessId: mockBusinessId, type: "SALE" },
      ];
      (db.query.transactionsTable.findMany as vi.Mock).mockResolvedValue(
        mockTransactions
      );

      const result = await get_transactions(mockBusinessId);
      expect(result).toEqual({ data: mockTransactions, error: null });
      expect(db.query.transactionsTable.findMany).toHaveBeenCalledWith({
        where: eq(transactionsTable.businessId, mockBusinessId),
        with: expect.any(Object),
      });
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await get_transactions("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.transactionsTable.findMany as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await get_transactions(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_audit_logs", () => {
    it("should return audit logs for a business", async () => {
      const mockAuditLogs = [
        { id: "log1", businessId: mockBusinessId, action: "create" },
      ];
      (db.query.auditLogsTable.findMany as vi.Mock).mockResolvedValue(
        mockAuditLogs
      );

      const result = await get_audit_logs(mockBusinessId);
      expect(result).toEqual({ data: mockAuditLogs, error: null });
      expect(db.query.auditLogsTable.findMany).toHaveBeenCalledWith({
        where: eq(auditLogsTable.businessId, mockBusinessId),
        with: expect.any(Object),
      });
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await get_audit_logs("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.auditLogsTable.findMany as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await get_audit_logs(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
