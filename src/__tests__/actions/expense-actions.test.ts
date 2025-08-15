import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
  getExpenses,
  getExpensesByTimeInterval,
  getExpenseById,
  createExpense,
} from "@/server/actions/expense-actions";
import * as expenseRepo from "@/server/repos/expenses-repo";
import * as authActions from "@/server/actions/auth-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { revalidatePath } from "next/cache";

vi.mock("@/server/repos/expenses-repo");
vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/helpers/role-permissions");
vi.mock("next/cache", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    revalidatePath: vi.fn(),
  };
});

describe("Expense Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockExpense = {
    id: "exp-1",
    amount: "100.00",
    reference: "REF-001",
    businessId: "biz-1",
    note: "Test expense",
    createdAt: new Date(),
    createdBy: "user-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  });

  describe("getExpenses", () => {
    it("should return expenses if user has permission", async () => {
      (expenseRepo.get_all_cached as Mock).mockResolvedValue({ data: [mockExpense], error: null });

      const result = await getExpenses();

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(expenseRepo.get_all_cached).toHaveBeenCalledWith(mockUser.businessId);
      expect(result).toEqual({ data: [mockExpense], error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getExpenses();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(expenseRepo.get_all_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all_cached fails", async () => {
      (expenseRepo.get_all_cached as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await getExpenses();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getExpensesByTimeInterval", () => {
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-01-31");

    it("should return expenses by time interval if user has permission", async () => {
      (expenseRepo.get_by_time_interval as Mock).mockResolvedValue({ data: [mockExpense], error: null });

      const result = await getExpensesByTimeInterval({ startDate, endDate });

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(expenseRepo.get_by_time_interval).toHaveBeenCalledWith(
        mockUser.businessId,
        startDate,
        endDate
      );
      expect(result).toEqual({ data: [mockExpense], error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getExpensesByTimeInterval({ startDate, endDate });

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(expenseRepo.get_by_time_interval).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_time_interval fails", async () => {
      (expenseRepo.get_by_time_interval as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await getExpensesByTimeInterval({ startDate, endDate });

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getExpenseById", () => {
    it("should return expense by id if user has permission", async () => {
      (expenseRepo.get_by_id as Mock).mockResolvedValue({ data: mockExpense, error: null });

      const result = await getExpenseById(mockExpense.id);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(expenseRepo.get_by_id).toHaveBeenCalledWith(mockExpense.id, mockUser.businessId);
      expect(result).toEqual({ data: mockExpense, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getExpenseById(mockExpense.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(expenseRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return missing input error if expenseId is empty", async () => {
      const result = await getExpenseById(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(expenseRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_id fails", async () => {
      (expenseRepo.get_by_id as Mock).mockResolvedValue({ data: null, error: ErrorCode.NOT_FOUND });

      const result = await getExpenseById(mockExpense.id);

      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });
  });

  describe("createExpense", () => {
    const newExpenseData = {
      amount: "50.00",
      reference: "NEW-REF",
      note: "New expense note",
    };

    it("should create an expense successfully", async () => {
      (expenseRepo.create as Mock).mockResolvedValue({ data: mockExpense, error: null });

      const result = await createExpense(newExpenseData);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(expenseRepo.create).toHaveBeenCalledWith({
        ...newExpenseData,
        businessId: mockUser.businessId,
        createdBy: mockUser.id,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/transactions");
      expect(result).toEqual({ data: mockExpense, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await createExpense(newExpenseData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(expenseRepo.create).not.toHaveBeenCalled();
    });

    it("should return missing input error if amount is empty", async () => {
      const result = await createExpense({ ...newExpenseData, amount: "" });

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(expenseRepo.create).not.toHaveBeenCalled();
    });

    it("should return error from repo if create fails", async () => {
      (expenseRepo.create as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await createExpense(newExpenseData);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });
});
