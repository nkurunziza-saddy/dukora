"use cache";
import { count, eq, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  productsTable,
  warehouseItemsTable,
  warehousesTable,
} from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export async function get_total_warehouses(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db
      .select({ count: count(warehousesTable) })
      .from(warehousesTable)
      .where(eq(warehousesTable.businessId, businessId));

    return { data: result[0]?.count || 0, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
export async function get_total_quantity(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db
      .select({
        totalQuantity: sum(warehouseItemsTable.quantity),
      })
      .from(warehouseItemsTable)
      .innerJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id),
      )
      .where(eq(warehousesTable.businessId, businessId));

    return result[0]?.totalQuantity || 0;
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_quantity_by_product(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db
      .select({
        productId: warehouseItemsTable.productId,
        totalQuantity: sum(warehouseItemsTable.quantity),
      })
      .from(warehouseItemsTable)
      .innerJoin(
        productsTable,
        eq(warehouseItemsTable.productId, productsTable.id),
      )
      .where(eq(productsTable.businessId, businessId))
      .groupBy(warehouseItemsTable.productId);

    return result;
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_quantity_by_warehouse(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db
      .select({
        warehouseId: warehouseItemsTable.warehouseId,
        totalQuantity: sum(warehouseItemsTable.quantity),
      })
      .from(warehouseItemsTable)
      .innerJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id),
      )
      .where(eq(warehousesTable.businessId, businessId))
      .groupBy(warehouseItemsTable.warehouseId);

    return result;
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_quantity_by_product_and_warehouse(
  businessId: string,
) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db
      .select({
        productId: warehouseItemsTable.productId,
        warehouseId: warehouseItemsTable.warehouseId,
        totalQuantity: sum(warehouseItemsTable.quantity),
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
      .where(eq(warehousesTable.businessId, businessId))
      .groupBy(warehouseItemsTable.productId, warehouseItemsTable.warehouseId);

    return result;
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
