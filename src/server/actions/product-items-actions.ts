"use server";

import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import {
  getProductsWithStockAlert,
  get_by_quantity as getStockWarehouseItemsByQuantity,
  get_negative_item as getNegativeStockWarehouseItems,
} from "@/server/repos/statistics/stock-stat-repo";

export async function getLowStockAlertProducts() {
  const currentUser = await getUserIfHasPermission(Permission.PRODUCT_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const productsResult = await getProductsWithStockAlert(
      currentUser.businessId!
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  } catch (error) {
    console.error("Error getting low stock products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getOutOfStockProducts() {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_VIEW
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const productsResult = await getStockWarehouseItemsByQuantity(
      currentUser.businessId!,
      0
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  } catch (error) {
    console.error("Error getting low stock warehouse items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getStockItemsByQuantity(quantity: number) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_VIEW
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const productsResult = await getStockWarehouseItemsByQuantity(
      currentUser.businessId!,
      quantity
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  } catch (error) {
    console.error("Error getting low stock warehouse items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getNegativeStockProducts() {
  const currentUser = await getUserIfHasPermission(Permission.PRODUCT_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const productsResult = await getNegativeStockWarehouseItems(
      currentUser.businessId!
    );
    if (productsResult.error) {
      return { data: null, error: productsResult.error };
    }
    return { data: productsResult.data, error: null };
  } catch (error) {
    console.error("Error getting negative stock products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
