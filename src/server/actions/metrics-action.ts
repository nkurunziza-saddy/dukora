"use server";

import {
  endOfMonth,
  isAfter,
  isBefore,
  startOfMonth,
  subMonths,
} from "date-fns";
import type {
  SelectProduct,
  SelectTransaction,
} from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { getWarehouseItemsByBusiness } from "@/server/actions/warehouse-item-actions";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { calculateClosingStock } from "@/server/helpers/accounting-formulas";
import { getCurrentMonthBoundary } from "@/server/helpers/time-date-forrmatters";
import * as metricsRepo from "@/server/repos/metrics-repo";
import * as transactionRepo from "@/server/repos/transaction-repo";
import { calculateAllMetrics } from "../helpers/accounting-formulas";
import { syncMetricsToDatabase } from "../helpers/db-functional-helpers";
import { get_all as get_all_businesses } from "../repos/business-repo";
import { getExpensesByTimeInterval } from "./expense-actions";

export async function calculateAndSyncMonthlyMetrics(dateFrom: Date) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };
  if (!dateFrom || Number.isNaN(dateFrom.getTime())) {
    console.error("Invalid date provided for metrics calculation");
    return { data: null, error: ErrorCode.BAD_REQUEST };
  }

  const currentMonthBoundary = getCurrentMonthBoundary();
  if (isAfter(dateFrom, currentMonthBoundary)) {
    console.warn(
      `Attempted to calculate metrics for future/current month: ${dateFrom.toISOString()}`
    );
    return { data: null, error: ErrorCode.BAD_REQUEST };
  }

  const dateTo = endOfMonth(dateFrom);

  try {
    const businessCreatedAt = currentUser.createdAt;

    if (isBefore(dateFrom, startOfMonth(businessCreatedAt))) {
      console.warn(
        `Attempted to calculate metrics before business creation: ${dateFrom.toISOString()}`
      );
      return {
        data: businessCreatedAt,
        error: ErrorCode.BEFORE_BUSINESS_CREATION,
      };
    }

    const transactions = await transactionRepo.get_by_time_interval(
      currentUser.businessId ?? "",
      dateFrom,
      dateTo
    );

    if (transactions.error) {
      console.error("Failed to fetch transactions:", transactions.error);
      return { data: null, error: transactions.error };
    }

    const transactionsFormatted = (transactions.data ?? [])
      .filter(
        (item: { transactions: SelectTransaction; products: SelectProduct }) =>
          item.products
      )
      .map(
        (item: {
          transactions: SelectTransaction;
          products: SelectProduct;
        }) => ({
          ...item.transactions,
          product: item.products,
        })
      );

    const prevMonth = subMonths(dateFrom, 1);
    const openingStockMetric = await metricsRepo.get_metric_by_name(
      currentUser.businessId ?? "",
      "closingStock",
      "monthly",
      prevMonth
    );
    const openingStockValue = Math.max(
      0,
      parseFloat(openingStockMetric.data?.value ?? "0")
    );

    const warehouseItemsReq = await getWarehouseItemsByBusiness(
      currentUser.businessId ?? ""
    );
    if (warehouseItemsReq.error) {
      console.error(
        "Failed to fetch warehouse items:",
        warehouseItemsReq.error
      );
      return { data: null, error: warehouseItemsReq.error };
    }

    const closingStockValue = calculateClosingStock(
      warehouseItemsReq.data ?? []
    );

    const expenses = await getExpensesByTimeInterval({
      startDate: dateFrom,
      endDate: dateTo,
    });
    if (expenses.error) {
      console.error("Failed to fetch expenses:", expenses.error);
      return { data: null, error: expenses.error };
    }

    const calculatedMetrics = calculateAllMetrics(
      transactionsFormatted,
      expenses.data || [],
      openingStockValue,
      closingStockValue
    );

    const syncResult = await syncMetricsToDatabase(
      currentUser.businessId ?? "",
      dateFrom,
      calculatedMetrics
    );

    if (syncResult.error) {
      console.error("Failed to sync metrics to database:", syncResult.error);
      return { data: calculatedMetrics, error: syncResult.error };
    }

    return { data: calculatedMetrics, error: null };
  } catch (error) {
    console.error("Failed to calculate and sync metrics:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getMonthlyMetrics(date: Date) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const metrics = await metricsRepo.get_monthly_metrics(
      currentUser.businessId ?? "",
      date
    );
    return metrics;
  } catch (error) {
    console.error("Failed to get monthly metrics:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function scheduleMonthlyMetricsSync() {
  try {
    let successCount = 0;
    let errorCount = 0;

    const businesses = await get_all_businesses();

    for (const business of businesses.data || []) {
      const result = await calculateAndSyncMonthlyMetrics(
        startOfMonth(new Date())
      );

      if (result.error) {
        console.error(
          `Failed to sync metrics for business ${business.id}:`,
          result.error
        );
        errorCount++;
      } else {
        successCount++;
      }
    }

    return { data: { errorCount, successCount }, error: null };
  } catch (error) {
    console.error("Failed to schedule metrics sync:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
