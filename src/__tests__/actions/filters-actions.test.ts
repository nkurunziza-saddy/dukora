import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { fetchTransactionsByFilters } from "@/server/actions/filters-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import * as transactionsStatRepo from "@/server/repos/statistics/transactions-stat-repo";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import * as permissionMiddleware from "@/server/actions/auth/permission-middleware";

vi.mock("@/server/actions/auth/permission-middleware", () => ({
  getUserIfHasPermission: vi.fn(),
}));

vi.mock("@/server/helpers/role-permissions");
vi.mock("@/server/repos/statistics/transactions-stat-repo");
vi.mock("../../../src/server/lib/role-permissions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../src/server/lib/role-permissions")>();
  return {
    ...actual,
    rolePermissions: {
      ...actual.rolePermissions,
      roleHasPermission: vi.fn(),
    },
  };
});

describe("Filters Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockTransactions = [
    { id: "trans-1", type: "SALE", quantity: 10, createdAt: new Date() },
    { id: "trans-2", type: "PURCHASE", quantity: 5, createdAt: new Date() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
    (permissionMiddleware.getUserIfHasPermission as Mock).mockResolvedValue(mockUser);
    (transactionsStatRepo.getFilteredTransactions as Mock).mockResolvedValue({
      data: mockTransactions,
      error: null,
    });
  });

  describe("fetchTransactionsByFilters", () => {
    it("should return filtered transactions if user has permission", async () => {
      (transactionsStatRepo.getFilteredTransactions as Mock).mockResolvedValue({
        data: mockTransactions,
        error: null,
      });

      const result = await fetchTransactionsByFilters();

      expect(transactionsStatRepo.getFilteredTransactions).toHaveBeenCalledWith(
        mockUser.id,
        10,
        0,
        "createdAt",
        "desc",
        undefined,
        undefined,
        undefined
      );
      expect(result).toEqual({ data: mockTransactions, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (permissionMiddleware.getUserIfHasPermission as Mock).mockResolvedValue(null);

      const result = await fetchTransactionsByFilters();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(
        transactionsStatRepo.getFilteredTransactions
      ).not.toHaveBeenCalled();
    });

    it("should pass correct parameters to getFilteredTransactions", async () => {
      (transactionsStatRepo.getFilteredTransactions as Mock).mockResolvedValue({
        data: mockTransactions,
        error: null,
      });

      const limit = 5;
      const offset = 10;
      const sortBy = "quantity";
      const sortOrder = "asc";
      const typeFilter = "SALE";
      const dateFrom = "2024-01-01";
      const dateTo = "2024-01-31";

      await fetchTransactionsByFilters(
        limit,
        offset,
        sortBy,
        sortOrder,
        typeFilter,
        dateFrom,
        dateTo
      );

      expect(transactionsStatRepo.getFilteredTransactions).toHaveBeenCalledWith(
        mockUser.id,
        limit,
        offset,
        sortBy,
        sortOrder,
        typeFilter,
        new Date(dateFrom),
        new Date(dateTo)
      );
    });

    it("should handle errors from getFilteredTransactions", async () => {
      (transactionsStatRepo.getFilteredTransactions as Mock).mockResolvedValue({
        data: null,
        error: "Repo Error",
      });

      const result = await fetchTransactionsByFilters();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
    });

    it("should catch and return generic error message for unexpected errors", async () => {
      (transactionsStatRepo.getFilteredTransactions as Mock).mockImplementation(
        () => {
          throw new Error(ErrorCode.UNAUTHORIZED);
        }
      );

      const result = await fetchTransactionsByFilters();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
    });

    it("should return generic error message if error is not an instance of Error", async () => {
      (transactionsStatRepo.getFilteredTransactions as Mock).mockImplementation(
        () => {
          throw "Non-Error object";
        }
      );

      const result = await fetchTransactionsByFilters();

      expect(result).toEqual({
        data: null,
        error: "Failed to get recent transactions",
      });
    });
  });
});
