import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import { getTotalProducts as getTotalProductsRepo } from "@/server/repos/statistics/product-stat-repo";
import { getTotalWarehouses as getTotalWarehousesRepo } from "@/server/repos/statistics/warehouse-stat-repo";
import {
  getProductsWithStockAlert as getProductsWithStockAlertRepo,
  getInventoryValue as getInventoryValueRepo,
} from "@/server/repos/statistics/stock-stat-repo";
import * as transactionRepo from "@/server/repos/statistics/transactions-stat-repo";
import { startOfToday, addDays, subDays } from "date-fns";

export const getTotalSKUCount = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const count = await getTotalProductsRepo(user.businessId!);
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data, error: null };
  }
);

export const getTotalWarehousesCount = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const count = await getTotalWarehousesRepo(user.businessId!);
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data, error: null };
  }
);

export const getLowStockProductsCount = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const count = await getProductsWithStockAlertRepo(user.businessId!);
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data.length, error: null };
  }
);

export const getCurrentInventoryValue = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const count = await getInventoryValueRepo(user.businessId!);
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data, error: null };
  }
);

export const getTodayTransactions = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const today = startOfToday();
    const tomorrow = addDays(today, 1);
    const yesterday = subDays(today, 1);
    const [resToday, resYesterday] = await Promise.all([
      transactionRepo.getTransactionMetricsForInterval(
        user.businessId!,
        today,
        tomorrow
      ),
      transactionRepo.getTransactionMetricsForInterval(
        user.businessId!,
        yesterday,
        today
      ),
    ]);
    return {
      data: { current: resToday.data, prev: resYesterday.data },
      error: null,
    };
  }
);
