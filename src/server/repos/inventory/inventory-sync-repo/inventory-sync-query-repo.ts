"use cache";

import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  productsTable,
  storeProductsTable,
  warehouseItemsTable,
  warehousesTable,
} from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

/**
 * Get real-time inventory status for a store product
 */
export const get_inventory_status_for_store_product = async (
  storeProductId: string,
  businessId: string,
) => {
  if (!storeProductId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const [result] = await db
      .select({
        storeProductId: storeProductsTable.id,
        productId: storeProductsTable.productId,
        cachedStock: storeProductsTable.cachedStock,
        warehouses: sql<any>`json_agg(json_build_object(
          'warehouseId', ${warehousesTable.id},
          'warehouseName', ${warehousesTable.name},
          'quantity', ${warehouseItemsTable.quantity},
          'reserved', ${warehouseItemsTable.reservedQty},
          'available', ${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}
        ))`,
        totalQuantity: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity}), 0)`,
        totalReserved: sql<number>`COALESCE(SUM(${warehouseItemsTable.reservedQty}), 0)`,
        totalAvailable: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
      })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id),
      )
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId),
      )
      .leftJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id),
      )
      .where(
        and(
          eq(storeProductsTable.id, storeProductId),
          eq(storeProductsTable.businessId, businessId),
        ),
      )
      .groupBy(storeProductsTable.id, productsTable.id);

    if (!result) {
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to get inventory status:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Check if sufficient inventory is available for checkout
 */
export const check_inventory_availability = async (
  items: { storeProductId: string; quantity: number }[],
  businessId: string,
) => {
  if (!items.length || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const checks = await Promise.all(
      items.map(async (item) => {
        const [result] = await db
          .select({
            storeProductId: storeProductsTable.id,
            productId: storeProductsTable.productId,
            productName: productsTable.name,
            storeTitle: storeProductsTable.storeTitle,
            available: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
          })
          .from(storeProductsTable)
          .innerJoin(
            productsTable,
            eq(storeProductsTable.productId, productsTable.id),
          )
          .leftJoin(
            warehouseItemsTable,
            eq(productsTable.id, warehouseItemsTable.productId),
          )
          .where(
            and(
              eq(storeProductsTable.id, item.storeProductId),
              eq(storeProductsTable.businessId, businessId),
              eq(storeProductsTable.isPublished, true),
            ),
          )
          .groupBy(
            storeProductsTable.id,
            productsTable.id,
            productsTable.name,
            storeProductsTable.storeTitle,
          );

        if (!result) {
          return {
            storeProductId: item.storeProductId,
            available: false,
            reason: "Product not found or not published",
            requested: item.quantity,
            inStock: 0,
          };
        }

        const available = Number(result.available) >= item.quantity;

        return {
          storeProductId: item.storeProductId,
          productName: result.storeTitle || result.productName,
          available,
          reason: available ? null : "Insufficient stock",
          requested: item.quantity,
          inStock: Number(result.available),
        };
      }),
    );

    const allAvailable = checks.every((c) => c.available);

    return {
      data: {
        available: allAvailable,
        items: checks,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to check inventory availability:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get products that need stock sync (cached != actual)
 */
export const get_products_needing_sync = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const products = await db
      .select({
        storeProductId: storeProductsTable.id,
        productId: storeProductsTable.productId,
        storeTitle: storeProductsTable.storeTitle,
        productName: productsTable.name,
        cachedStock: storeProductsTable.cachedStock,
        actualStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
      })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id),
      )
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId),
      )
      .where(
        and(
          eq(storeProductsTable.businessId, businessId),
          eq(storeProductsTable.isPublished, true),
          isNull(storeProductsTable.deletedAt),
        ),
      )
      .groupBy(
        storeProductsTable.id,
        productsTable.id,
        storeProductsTable.storeTitle,
        productsTable.name,
        storeProductsTable.cachedStock,
      )
      .having(
        sql`${storeProductsTable.cachedStock} != COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
      );

    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to get products needing sync:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get warehouse items for a specific product
 */
export const get_warehouse_items_for_product = async (
  productId: string,
  businessId: string,
) => {
  if (!productId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const items = await db
      .select({
        warehouseItemId: warehouseItemsTable.id,
        warehouseId: warehousesTable.id,
        warehouseName: warehousesTable.name,
        quantity: warehouseItemsTable.quantity,
        reservedQty: warehouseItemsTable.reservedQty,
        available: sql<number>`${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}`,
      })
      .from(warehouseItemsTable)
      .innerJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id),
      )
      .innerJoin(
        productsTable,
        eq(warehouseItemsTable.productId, productsTable.id),
      )
      .where(
        and(
          eq(warehouseItemsTable.productId, productId),
          eq(warehousesTable.businessId, businessId),
          gt(warehouseItemsTable.quantity, 0),
        ),
      )
      .orderBy(
        sql`${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty} DESC`,
      );

    return { data: items, error: null };
  } catch (error) {
    console.error("Failed to get warehouse items:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
