"use server";

import { revalidateTag } from "next/cache";
import type { InsertExpense } from "@/lib/schema/schema-types";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as expenseRepo from "../repos/expenses-repo";

export const getExpenses = createProtectedAction(
  PERMISSION.FINANCIAL_VIEW,
  async (user) => {
    const expenses = await expenseRepo.get_all(user.businessId ?? "");
    if (expenses.error) {
      return { data: null, error: expenses.error };
    }
    return { data: expenses.data, error: null };
  }
);

export const getExpensesPaginated = createProtectedAction(
  PERMISSION.FINANCIAL_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const expenses = await expenseRepo.get_all_paginated(
      user.businessId ?? "",
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
  PERMISSION.FINANCIAL_VIEW,
  async (user, { startDate, endDate }: { startDate: Date; endDate: Date }) => {
    const expenses = await expenseRepo.get_by_time_interval(
      user.businessId ?? "",
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
  PERMISSION.FINANCIAL_VIEW,
  async (user, expenseId: string) => {
    if (!expenseId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const expense = await expenseRepo.get_by_id(
      expenseId,
      user.businessId ?? ""
    );
    if (expense.error) {
      return { data: null, error: expense.error };
    }
    return { data: expense.data, error: null };
  }
);

export const createExpense = createProtectedAction(
  PERMISSION.FINANCIAL_VIEW,
  async (
    user,
    expenseData: Omit<InsertExpense, "businessId" | "id" | "createdBy">
  ) => {
    if (!expenseData.amount) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const expense: InsertExpense = {
      ...expenseData,
      businessId: user.businessId ?? "",
      createdBy: user.id,
    };
    const { data: resData, error: resError } =
      await expenseRepo.create(expense);
    if (resError) {
      return { data: null, error: resError };
    }
    revalidateTag(`expense-${resData.id}`, "max");
    revalidateTag(`expenses-${user.businessId}`, "max");
    revalidateTag("expenses", "max");
    revalidateTag(`transactions-${user.businessId}`, "max");
    return { data: resData, error: null };
  }
);
