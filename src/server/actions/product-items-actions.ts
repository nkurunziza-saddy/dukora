"use server";

import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import {
  getProductsWithStockAlert,
  get_by_quantity as getStockWarehouseItemsByQuantity,
  get_negative_item as getNegativeStockWarehouseItems,
} from "@/server/repos/statistics/stock-stat-repo";

export const getLowStockAlertProducts = createProtectedAction(
  Permission.PRODUCT_VIEW,
  async (user) => {
    const productsResult = await getProductsWithStockAlert(user.businessId!);
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  }
);

export const getOutOfStockProducts = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (user) => {
    const productsResult = await getStockWarehouseItemsByQuantity(
      user.businessId!,
      0
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  }
);

export const getStockItemsByQuantity = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (user, quantity: number) => {
    const productsResult = await getStockWarehouseItemsByQuantity(
      user.businessId!,
      quantity
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  }
);

export const getNegativeStockProducts = createProtectedAction(
  Permission.PRODUCT_VIEW,
  async (user) => {
    const productsResult = await getNegativeStockWarehouseItems(
      user.businessId!
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  }
);
