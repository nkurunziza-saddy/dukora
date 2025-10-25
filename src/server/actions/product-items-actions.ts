"use server";

import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as stockStatRepo from "@/server/repos/statistics-repo/stock-stat-repo";

export const getLowStockAlertProducts = createProtectedAction(
  Permission.PRODUCT_VIEW,
  async (user) => {
    const productsResult = await stockStatRepo.get_products_with_stock_alert(
      user.businessId ?? "",
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  },
);

export const getOutOfStockProducts = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (user) => {
    const productsResult = await stockStatRepo.get_by_quantity(
      user.businessId ?? "",
      0,
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  },
);

export const getStockItemsByQuantity = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (user, quantity: number) => {
    const productsResult = await stockStatRepo.get_by_quantity(
      user.businessId ?? "",
      quantity,
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  },
);

export const getNegativeStockProducts = createProtectedAction(
  Permission.PRODUCT_VIEW,
  async (user) => {
    const productsResult = await stockStatRepo.get_negative_item(
      user.businessId ?? "",
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  },
);
