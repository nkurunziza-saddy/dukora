"use server";

import type {
  InsertTransaction,
  TransactionType,
} from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as transactionRepo from "../repos/transaction-repo";

export const getTransactions = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const transactions = await transactionRepo.get_all_cached(user.businessId!);
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  }
);

export const getTransactionsPaginated = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, { page = 1, limit = 50 }: { page?: number; limit?: number }) => {
    const result = await transactionRepo.get_paginated(
      user.businessId!,
      page,
      limit
    );

    if (result.error) {
      return { data: null, error: result.error, pagination: null };
    }

    return {
      data: result.data,
      error: null,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }
);

export const getTransactionsByTimeInterval = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, { startDate, endDate }: { startDate: Date; endDate: Date }) => {
    const transactions = await transactionRepo.get_time_interval_with_with(
      user.businessId!,
      startDate,
      endDate
    );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  }
);

export const getTransactionById = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, transactionId: string) => {
    if (!transactionId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const transaction = await transactionRepo.get_by_id(
      transactionId,
      user.businessId!
    );
    if (transaction.error) {
      return { data: null, error: transaction.error };
    }
    return { data: transaction.data, error: null };
  }
);

export const createTransaction = createProtectedAction(
  Permission.TRANSACTION_PURCHASE_CREATE,
  async (
    user,
    transactionData: Omit<InsertTransaction, "businessId" | "id" | "createdBy">
  ) => {
    if (
      !transactionData.productId?.trim() ||
      !transactionData.warehouseItemId?.trim() ||
      !transactionData.type ||
      typeof transactionData.quantity !== "number"
    ) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const transaction: InsertTransaction = {
      ...transactionData,
      businessId: user.businessId!,
      createdBy: user.id,
    };
    const { data: resData, error: resError } =
      await transactionRepo.create(transaction);
    if (resError) {
      return { data: null, error: resError };
    }

    return { data: resData, error: null };
  }
);

export const createTransactionAndWarehouseItem = createProtectedAction(
  Permission.TRANSACTION_PURCHASE_CREATE,
  async (
    user,
    transactionData: Omit<
      InsertTransaction,
      "businessId" | "id" | "createdBy" | "warehouseItemId"
    >
  ) => {
    if (
      !transactionData.productId?.trim() ||
      !transactionData.type ||
      typeof transactionData.quantity !== "number"
    ) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const transaction = {
      ...transactionData,
      businessId: user.businessId!,
      createdBy: user.id,
    };
    const { data: resData, error: resError } =
      await transactionRepo.create_with_warehouse_item(transaction);
    if (resError) {
      return { data: null, error: resError };
    }
    return { data: resData, error: null };
  }
);

export const getTransactionsByType = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, type: TransactionType) => {
    if (!type) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const transactions = await transactionRepo.get_by_type(
      user.businessId!,
      type
    );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  }
);
