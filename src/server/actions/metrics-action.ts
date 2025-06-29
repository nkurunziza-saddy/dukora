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

export async function calculateAndSyncMonthlyMetrics(date: Date) {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };
  const dateFrom = startOfMonth(date);
  const dateTo = endOfMonth(date);
  try {
    const transactions = await transactionRepo.getByTimeInterval(
      currentUser.businessId!,
      dateFrom,
      dateTo
    );

    if (transactions.error) {
      return { data: null, error: transactions.error };
    }

    // const metrics = await metricsRepo.getMonthlyMetrics(
    //   currentUser.businessId!,
    //   month
    // );
    // if (metrics.error) {
    //   return { data: null, error: metrics.error };
    // }
    // if (metrics) return { data: metrics.data, error: null };
    const prevMonth = subMonths(date, 1);
    const previousClosingStock = await metricsRepo.getMetricByName(
      currentUser.businessId!,
      "closingStock",
      "monthly",
      prevMonth
    );

    if (previousClosingStock.error) {
      return { data: null, error: previousClosingStock.error };
    }

    const calculatedMetrics = calculateAllMetrics(
      transactions.data,
      Number(previousClosingStock.data?.value) || 0
    );

    await syncMetricsToDatabase(
      currentUser.businessId!,
      date,
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
