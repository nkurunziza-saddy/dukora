"use server";

import * as metricsRepo from "@/server/repos/metrics-repo";
import * as transactionRepo from "@/server/repos/transaction-repo";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { getAll as getAllBusinesses } from "../repos/business-repo";
import { calculateAllMetrics } from "../helpers/accounting-formulas";
import { syncMetricsToDatabase } from "../helpers/db-functional-helpers";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { getWarehouseItemsByBusiness } from "@/server/actions/warehouse-item-actions";
import { calculateClosingStock } from "@/server/helpers/accounting-formulas";
import { getExpensesByTimeInterval } from "./expense-actions";
import type {
  SelectProduct,
  SelectTransaction,
} from "@/lib/schema/schema-types";

export async function calculateAndSyncMonthlyMetrics(dateFrom: Date) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };
  const dateTo = endOfMonth(dateFrom);
  try {
    const businessCreatedAt = currentUser.createdAt;

    const transactions = await transactionRepo.getByTimeInterval(
      currentUser.businessId!,
      dateFrom,
      dateTo
    );
    const transactionsFormatted = (transactions.data ?? []).map(
      (item: { transactions: SelectTransaction; products: SelectProduct }) => ({
        ...item.transactions,
        product: item.products,
      })
    );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    if (dateFrom < businessCreatedAt) {
      return { data: null, error: ErrorCode.BAD_REQUEST };
    }
    if (dateFrom === businessCreatedAt) {
      return {};
    }

    const prevMonth = subMonths(dateFrom, 1);
    const openingStockMetric = await metricsRepo.getMetricByName(
      currentUser.businessId!,
      "closingStock",
      "monthly",
      prevMonth
    );
    const openingStockValue = parseFloat(openingStockMetric.data?.value ?? "0");

    const warehouseItemsReq = await getWarehouseItemsByBusiness(
      currentUser.businessId!
    );
    if (warehouseItemsReq.error) {
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
      return { data: null, error: expenses.error };
    }

    const calculatedMetrics = calculateAllMetrics(
      transactionsFormatted,
      expenses.data!,
      openingStockValue,
      closingStockValue
    );

    await syncMetricsToDatabase(
      currentUser.businessId!,
      dateFrom,
      calculatedMetrics
    );

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
    const metrics = await metricsRepo.getMonthlyMetrics(
      currentUser.businessId!,
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

    const businesses = await getAllBusinesses();

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
        console.log(`Successfully synced metrics for business ${business.id}`);
        successCount++;
      }
    }

    return { data: { errorCount, successCount }, error: null };
  } catch (error) {
    console.error("Failed to schedule metrics sync:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
