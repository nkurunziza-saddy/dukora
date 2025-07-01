"use server";

import type { InsertExpense } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import {
  getAll as getAllExpensesRepo,
  getById as getExpenseByIdRepo,
  create as createExpenseRepo,
  getByTimeInterval as getExpensesByTimeIntervalRepo,
} from "../repos/expenses-repo";

export async function getExpenses() {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const expenses = await getAllExpensesRepo(currentUser.businessId!);
    if (expenses.error) {
      return { data: null, error: expenses.error };
    }
    return { data: expenses.data, error: null };
  } catch (error) {
    console.error("Error getting expenses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getExpensesByTimeInterval(
  startDate: Date,
  endDate: Date
) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const expenses = await getExpensesByTimeIntervalRepo(
      currentUser.businessId!,
      startDate,
      endDate
    );
    if (expenses.error) {
      return { data: null, error: expenses.error };
    }
    return { data: expenses.data, error: null };
  } catch (error) {
    console.error("Error getting expenses by time interval:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getExpenseById(expenseId: string) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!expenseId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const expense = await getExpenseByIdRepo(
      expenseId,
      currentUser.businessId!
    );
    if (expense.error) {
      return { data: null, error: expense.error };
    }
    return { data: expense.data, error: null };
  } catch (error) {
    console.error("Error getting expense by id:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createExpense(
  expenseData: Omit<InsertExpense, "businessId" | "id" | "createdBy">
) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!expenseData.amount) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const expense: InsertExpense = {
      ...expenseData,
      businessId: currentUser.businessId!,
      createdBy: currentUser.id,
    };
    const { data: resData, error: resError } = await createExpenseRepo(expense);
    if (resError) {
      return { data: null, error: resError };
    }

    revalidateTag(`expenses-${currentUser.businessId!}`);

    return { data: resData, error: null };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
