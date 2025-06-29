import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { getTotalProducts as getTotalProductsRepo } from "@/server/repos/statistics/product-stat-repo";
import { getTotalWarehouses as getTotalWarehousesRepo } from "@/server/repos/statistics/warehouse-stat-repo";
import {
  getProductsWithStockAlert as getProductsWithStockAlertRepo,
  getInventoryValue as getInventoryValueRepo,
} from "@/server/repos/statistics/stock-stat-repo";
import * as transactionRepo from "@/server/repos/statistics/transactions-stat-repo";
import { startOfToday, addDays, subDays } from "date-fns";

export async function getTotalSKUCount() {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const count = await getTotalProductsRepo(currentUser.businessId!);
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getTotalWarehousesCount() {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const count = await getTotalWarehousesRepo(currentUser.businessId!);
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getLowStockProductsCount() {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const count = await getProductsWithStockAlertRepo(currentUser.businessId!);
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data.length, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
export async function getCurrentInventoryValue() {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const count = await getInventoryValueRepo(currentUser.businessId!);
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getTodayTransactions() {
  const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };
  try {
    const today = startOfToday();
    const tomorrow = addDays(today, 1);
    const yesterday = subDays(today, 1);
    const [resToday, resYesterday] = await Promise.all([
      transactionRepo.getTransactionMetricsForInterval(
        currentUser.businessId!,
        today,
        tomorrow
      ),
      transactionRepo.getTransactionMetricsForInterval(
        currentUser.businessId!,
        yesterday,
        today
      ),
    ]);
    return {
      data: { current: resToday.data, prev: resYesterday.data },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get today's metrics",
    };
  }
}
