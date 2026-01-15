"use server";

import { revalidateTag } from "next/cache";
import type {
  InsertTransaction,
  TransactionType,
} from "@/lib/schema/schema.types";
import { calculateTaxAmount } from "@/server/business-logic/taxes/calculate-tax";
import {
  validateTransactionData,
  validateTransactionDataWithoutWarehouse,
  validateTransactionId,
  validateTransactionType,
} from "@/server/business-logic/transactions";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as businessSettingsRepo from "@/server/repos/business/business-settings-repo";
import * as inventoryProductRepo from "@/server/repos/inventory/inventory-product-repo";
import * as transactionRepo from "@/server/repos/shared/transaction-repo";

export const getTransactions = createProtectedAction(
  PERMISSION.FINANCIAL_VIEW,
  async (user) => {
    const transactions = await transactionRepo.get_all(user.businessId ?? "");
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  },
);

export const getTransactionsPaginated = createProtectedAction(
  PERMISSION.FINANCIAL_VIEW,
  async (
    user,
    {
      page,
      pageSize,
      sorting,
      filters,
      search,
    }: {
      page: number;
      pageSize: number;
      sorting?: { id: string; desc: boolean }[];
      filters?: { id: string; value: unknown }[];
      search?: string;
    },
  ) => {
    const transactions = await transactionRepo.get_all_paginated(
      user.businessId ?? "",
      page,
      pageSize,
      sorting,
      filters,
      search,
    );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  },
);

export const getTransactionsByTimeInterval = createProtectedAction(
  PERMISSION.FINANCIAL_VIEW,
  async (user, { startDate, endDate }: { startDate: Date; endDate: Date }) => {
    const transactions = await transactionRepo.get_time_interval_with_with(
      user.businessId ?? "",
      startDate,
      endDate,
    );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  },
);

export const getTransactionsByTimeIntervalPaginated = createProtectedAction(
  PERMISSION.FINANCIAL_VIEW,
  async (
    user,
    {
      startDate,
      endDate,
      page,
      pageSize,
    }: { startDate: Date; endDate: Date; page: number; pageSize: number },
  ) => {
    const transactions =
      await transactionRepo.get_time_interval_with_with_paginated(
        user.businessId ?? "",
        startDate,
        endDate,
        page,
        pageSize,
      );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  },
);

export const getTransactionById = createProtectedAction(
  PERMISSION.FINANCIAL_VIEW,
  async (user, transactionId: string) => {
    const validation = validateTransactionId(transactionId);
    if (!validation.valid) {
      return { data: null, error: validation.error };
    }

    const transaction = await transactionRepo.get_by_id(
      transactionId,
      user.businessId ?? "",
    );
    if (transaction.error) {
      return { data: null, error: transaction.error };
    }
    return { data: transaction.data, error: null };
  },
);

export const createTransaction = createProtectedAction(
  PERMISSION.TRANSACTION_PURCHASE_CREATE,
  async (
    user,
    transactionData: Omit<InsertTransaction, "businessId" | "id" | "createdBy">,
  ) => {
    const validation = validateTransactionData(transactionData);
    if (!validation.valid) {
      return { data: null, error: validation.error };
    }

    const transaction: InsertTransaction = {
      ...transactionData,
      businessId: user.businessId ?? "",
      createdBy: user.id,
    };

    const productRes = await inventoryProductRepo.get_by_id(
      transaction.productId,
      user.businessId ?? "",
    );
    const settingsRes = await businessSettingsRepo.get_all(
      user.businessId ?? "",
    );

    let notificationPayload: any;

    if (productRes.data && settingsRes.data) {
      const product = productRes.data;
      const settings = settingsRes.data;

      let taxRate = 0;
      let pricesIncludeTax = false;

      const taxRateSetting = settings.find((s) => s.key === "defaultVatRate");
      if (taxRateSetting) {
        taxRate = Number(taxRateSetting.value) || 0;
      }

      const pricesIncludeTaxSetting = settings.find(
        (s) => s.key === "pricesIncludeTax",
      );
      if (pricesIncludeTaxSetting) {
        pricesIncludeTax = Boolean(pricesIncludeTaxSetting.value);
      }

      if (transaction.type === "SALE") {
        const rawAmount = transaction.quantity * Number(product.price);
        let finalAmount = rawAmount;
        let taxAmount = 0;

        if (pricesIncludeTax) {
          taxAmount = calculateTaxAmount(rawAmount, taxRate, true);
          finalAmount = rawAmount;
        } else {
          taxAmount = calculateTaxAmount(rawAmount, taxRate, false);
          finalAmount = rawAmount + taxAmount;
        }

        const taxText =
          taxAmount > 0 ? ` (incl. ${taxAmount.toFixed(2)} Tax)` : "";

        notificationPayload = {
          type: "order",
          priority: "medium",
          title: "New Sale Recorded",
          message: `A new sale of ${transaction.quantity} ${product.name} was recorded. Total: ${finalAmount.toFixed(2)}${taxText}`,
          data: {
            productId: transaction.productId,
            productName: product.name,
            quantity: transaction.quantity,
            amount: finalAmount,
            tax: taxAmount,
          },
        };
      } else if (transaction.type === "PURCHASE") {
        const amount = transaction.quantity * Number(product.costPrice);
        notificationPayload = {
          type: "inventory",
          priority: "low",
          title: "New Purchase Recorded",
          message: `A new purchase of ${transaction.quantity} ${product.name} was recorded.`,
          data: {
            productId: transaction.productId,
            productName: product.name,
            quantity: transaction.quantity,
            amount: amount,
          },
        };
      }
    }

    const { data: resData, error: resError } = await transactionRepo.create(
      transaction,
      notificationPayload,
    );
    if (resError) {
      return { data: null, error: resError };
    }

    revalidateTag(`transactions-${user.businessId}`, "max");
    revalidateTag("transactions", "max");
    return { data: resData, error: null };
  },
);

export const createTransactionAndWarehouseItem = createProtectedAction(
  PERMISSION.TRANSACTION_PURCHASE_CREATE,
  async (
    user,
    transactionData: Omit<
      InsertTransaction,
      "businessId" | "id" | "createdBy" | "warehouseItemId"
    >,
  ) => {
    const validation = validateTransactionDataWithoutWarehouse(transactionData);
    if (!validation.valid) {
      return { data: null, error: validation.error };
    }

    const transaction = {
      ...transactionData,
      businessId: user.businessId ?? "",
      createdBy: user.id,
    };

    const productRes = await inventoryProductRepo.get_by_id(
      transaction.productId,
      user.businessId ?? "",
    );
    const settingsRes = await businessSettingsRepo.get_all(
      user.businessId ?? "",
    );

    let notificationPayload: any;

    if (productRes.data && settingsRes.data) {
      const product = productRes.data;
      const settings = settingsRes.data;

      let taxRate = 0;
      let pricesIncludeTax = false;

      const taxRateSetting = settings.find((s) => s.key === "defaultVatRate");
      if (taxRateSetting) {
        taxRate = Number(taxRateSetting.value) || 0;
      }

      const pricesIncludeTaxSetting = settings.find(
        (s) => s.key === "pricesIncludeTax",
      );
      if (pricesIncludeTaxSetting) {
        pricesIncludeTax = Boolean(pricesIncludeTaxSetting.value);
      }

      if (transaction.type === "SALE") {
        const rawAmount = transaction.quantity * Number(product.price);
        let finalAmount = rawAmount;
        let taxAmount = 0;

        if (pricesIncludeTax) {
          taxAmount = calculateTaxAmount(rawAmount, taxRate, true);
          finalAmount = rawAmount;
        } else {
          taxAmount = calculateTaxAmount(rawAmount, taxRate, false);
          finalAmount = rawAmount + taxAmount;
        }

        const taxText =
          taxAmount > 0 ? ` (incl. ${taxAmount.toFixed(2)} Tax)` : "";

        notificationPayload = {
          type: "order",
          priority: "medium",
          title: "New Sale Recorded",
          message: `A new sale of ${transaction.quantity} ${product.name} was recorded. Total: ${finalAmount.toFixed(2)}${taxText}`,
          data: {
            productId: transaction.productId,
            productName: product.name,
            quantity: transaction.quantity,
            amount: finalAmount,
            tax: taxAmount,
          },
        };
      } else if (transaction.type === "PURCHASE") {
        const amount = transaction.quantity * Number(product.costPrice);
        notificationPayload = {
          type: "inventory",
          priority: "low",
          title: "New Purchase Recorded",
          message: `A new purchase of ${transaction.quantity} ${product.name} was recorded.`,
          data: {
            productId: transaction.productId,
            productName: product.name,
            quantity: transaction.quantity,
            amount: amount,
          },
        };
      }
    }

    const { data: resData, error: resError } =
      await transactionRepo.create_with_warehouse_item(
        transaction,
        notificationPayload,
      );
    if (resError) {
      return { data: null, error: resError };
    }

    revalidateTag(`transactions-${user.businessId}`, "max");
    revalidateTag("transactions", "max");
    revalidateTag(`warehouse-item-${user.businessId}`, "max");
    revalidateTag("warehouse-items", "max");
    return { data: resData, error: null };
  },
);

export const getTransactionsByType = createProtectedAction(
  PERMISSION.FINANCIAL_VIEW,
  async (user, type: TransactionType) => {
    const validation = validateTransactionType(type);
    if (!validation.valid) {
      return { data: null, error: validation.error };
    }

    const transactions = await transactionRepo.get_by_type(
      user.businessId ?? "",
      type,
    );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  },
);
