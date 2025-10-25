import { addDays, startOfToday, subDays } from "date-fns";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import { get_total_products } from "@/server/repos/statistics-repo/product-stat-repo";
import {
  get_inventory_value,
  get_products_with_stock_alert,
} from "@/server/repos/statistics-repo/stock-stat-repo";
import * as transactionRepo from "@/server/repos/statistics-repo/transactions-stat-repo";
import { get_total_warehouses } from "@/server/repos/statistics-repo/warehouse-stat-repo";

export const getTotalSKUCount = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const count = await get_total_products(user.businessId ?? "");
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data, error: null };
  },
);

export const getTotalWarehousesCount = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const count = await get_total_warehouses(user.businessId ?? "");
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data, error: null };
  },
);

export const getLowStockProductsCount = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const count = await get_products_with_stock_alert(user.businessId ?? "");
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data.length, error: null };
  },
);

export const getCurrentInventoryValue = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const count = await get_inventory_value(user.businessId ?? "");
    if (count.error) {
      return { data: null, error: count.error };
    }
    return { data: count.data, error: null };
  },
);

export const getTodayTransactions = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const today = startOfToday();
    const tomorrow = addDays(today, 1);
    const yesterday = subDays(today, 1);
    const [resToday, resYesterday] = await Promise.all([
      transactionRepo.get_transaction_metrics_for_interval(
        user.businessId ?? "",
        today,
        tomorrow,
      ),
      transactionRepo.get_transaction_metrics_for_interval(
        user.businessId ?? "",
        yesterday,
        today,
      ),
    ]);
    return {
      data: { current: resToday.data, prev: resYesterday.data },
      error: null,
    };
  },
);
