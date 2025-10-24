"use server";

import { revalidatePath } from "next/cache";
import type { InsertExpense } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as expenseRepo from "../repos/expenses-repo";

export const getExpenses = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const expenses = await expenseRepo.get_all_cached(user.businessId!);
    if (expenses.error) {
      return { data: null, error: expenses.error };
    }
    return { data: expenses.data, error: null };
  }
);

export const getExpensesPaginated = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const expenses = await expenseRepo.get_all_paginated_cached(
      user.businessId!,
      page,
      pageSize
    );
    if (expenses.error) {
      return { data: null, error: expenses.error };
    }
    return { data: expenses.data, error: null };
  }
);

export const getExpensesByTimeInterval = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, { startDate, endDate }: { startDate: Date; endDate: Date }) => {
    const expenses = await expenseRepo.get_by_time_interval(
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
    const expense = await expenseRepo.get_by_id(expenseId, user.businessId!);
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
    const { data: resData, error: resError } =
      await expenseRepo.create(expense);
    if (resError) {
      return { data: null, error: resError };
    }
    revalidatePath("/transactions");
    return { data: resData, error: null };
  }
);
