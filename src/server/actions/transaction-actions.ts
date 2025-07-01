"use server";

import type {
  InsertTransaction,
  TransactionType,
} from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import {
  getAll as getAllTransactionsRepo,
  getById as getTransactionByIdRepo,
  create_with_warehouse_item as createWithWarehouseItem,
  create as createTransactionRepo,
  getByType as getTransactionsByTypeRepo,
} from "../repos/transaction-repo";
import { getByTimeIntervalWithWith } from "@/server/repos/transaction-repo";

export async function getTransactions() {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const transactions = await getAllTransactionsRepo(currentUser.businessId!);
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  } catch (error) {
    console.error("Error getting transactions:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getTransactionsByTimeInterval(
  startDate: Date,
  endDate: Date
) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const transactions = await getByTimeIntervalWithWith(
      currentUser.businessId!,
      startDate,
      endDate
    );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  } catch (error) {
    console.error("Error getting transactions:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getTransactionById(transactionId: string) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!transactionId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transaction = await getTransactionByIdRepo(
      transactionId,
      currentUser.businessId!
    );

    if (transaction.error) {
      return { data: null, error: transaction.error };
    }

    return { data: transaction.data, error: null };
  } catch (error) {
    console.error("Error getting transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createTransaction(
  transactionData: Omit<InsertTransaction, "businessId" | "id" | "createdBy">
) {
  const currentUser = await getUserIfHasPermission(
    Permission.TRANSACTION_PURCHASE_CREATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (
    !transactionData.productId?.trim() ||
    !transactionData.warehouseItemId?.trim() ||
    !transactionData.type ||
    typeof transactionData.quantity !== "number"
  ) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transaction: InsertTransaction = {
      ...transactionData,
      businessId: currentUser.businessId!,
      createdBy: currentUser.id,
    };
    const { data: resData, error: resError } = await createTransactionRepo(
      transaction
    );
    if (resError) {
      return { data: null, error: resError };
    }

    revalidateTag(`transactions-${currentUser.businessId!}`);
    revalidateTag(`warehouse-items-${currentUser.businessId!}`);

    return { data: resData, error: null };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createTransactionAndWarehouseItem(
  transactionData: Omit<
    InsertTransaction,
    "businessId" | "id" | "createdBy" | "warehouseItemId"
  >
) {
  const currentUser = await getUserIfHasPermission(
    Permission.TRANSACTION_PURCHASE_CREATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (
    !transactionData.productId?.trim() ||
    !transactionData.type ||
    typeof transactionData.quantity !== "number"
  ) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transaction = {
      ...transactionData,
      businessId: currentUser.businessId!,
      createdBy: currentUser.id,
    };
    const { data: resData, error: resError } = await createWithWarehouseItem(
      transaction
    );
    if (resError) {
      return { data: null, error: resError };
    }

    revalidateTag(`transactions-${currentUser.businessId!}`);
    revalidateTag(`warehouse-items-${currentUser.businessId!}`);

    return { data: resData, error: null };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getTransactionsByType(type: TransactionType) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!type) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transactions = await getTransactionsByTypeRepo(
      currentUser.businessId!,
      type
    );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  } catch (error) {
    console.error("Error getting transactions by type:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
