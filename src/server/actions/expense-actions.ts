"use server";

import type { InsertExpense } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { createProtectedAction } from "@/server/helpers/action-factory";
import {
  getAll as getAllExpensesRepo,
  getById as getExpenseByIdRepo,
  create as createExpenseRepo,
  getByTimeInterval as getExpensesByTimeIntervalRepo,
} from "../repos/expenses-repo";
import { revalidatePath } from "next/cache";

export const getExpenses = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const expenses = await getAllExpensesRepo(user.businessId!);
    if (expenses.error) {
      return { data: null, error: expenses.error };
    }
    return { data: expenses.data, error: null };
  }
);

export const getExpensesByTimeInterval = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, { startDate, endDate }: { startDate: Date; endDate: Date }) => {
    const expenses = await getExpensesByTimeIntervalRepo(
      user.businessId!,
      startDate,
      endDate
    );
    if (expenses.error) {
      return { data: null, error: expenses.error };
    }
    return { data: expenses.data, error: null };
  }
);

export const getExpenseById = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, expenseId: string) => {
    if (!expenseId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const expense = await getExpenseByIdRepo(expenseId, user.businessId!);
    if (expense.error) {
      return { data: null, error: expense.error };
    }
    return { data: expense.data, error: null };
  }
);

export const createExpense = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (
    user,
    expenseData: Omit<InsertExpense, "businessId" | "id" | "createdBy">
  ) => {
    if (!expenseData.amount) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const expense: InsertExpense = {
      ...expenseData,
      businessId: user.businessId!,
      createdBy: user.id,
    };
    const { data: resData, error: resError } = await createExpenseRepo(expense);
    if (resError) {
      return { data: null, error: resError };
    }
    revalidatePath("/transactions");
    return { data: resData, error: null };
  }
);
