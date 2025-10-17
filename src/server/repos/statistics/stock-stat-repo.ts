import { and, asc, desc, eq, lt, lte, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  productsTable,
  warehouseItemsTable,
  warehousesTable,
} from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export async function getProductsWithMostQuantity(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const products = await db
      .select()
      .from(warehouseItemsTable)
      .innerJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id),
      )
      .where(eq(warehousesTable.businessId, businessId))
      .orderBy(desc(warehouseItemsTable.quantity))
      .limit(5);
    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getProductsWithLowestQuantity(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const products = await db
      .select()
      .from(warehouseItemsTable)
      .innerJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id),
      )
      .where(eq(warehousesTable.businessId, businessId))
      .orderBy(asc(warehouseItemsTable.quantity))
      .limit(5);
    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getProductsWithStockAlert(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const products = await db
      .select()
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
          eq(productsTable.businessId, businessId),
          lte(warehouseItemsTable.quantity, productsTable.reorderPoint),
        ),
      )
      .orderBy(asc(warehouseItemsTable.quantity))
      .limit(5);
    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_by_quantity(
  businessId: string,
  threshold: number = 5,
  fn?: string,
) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const items = await db
      .select()
      .from(warehouseItemsTable)
      .innerJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id),
      )
      .where(
        and(
          eq(warehousesTable.businessId, businessId),
          fn === "equal"
            ? eq(warehouseItemsTable.quantity, threshold)
            : lte(warehouseItemsTable.quantity, threshold),
        ),
      );
    return { data: items, error: null };
  } catch (error) {
    console.error("Failed to fetch low stock warehouse items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_negative_item(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const items = await db
      .select()
      .from(warehouseItemsTable)
      .innerJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id),
      )
      .where(
        and(
          eq(warehousesTable.businessId, businessId),
          lt(warehouseItemsTable.quantity, 0),
        ),
      );
    return { data: items, error: null };
  } catch (error) {
    console.error("Failed to fetch negative stock warehouse items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getInventoryValue(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db
      .select({
        totalQuantity: sum(warehouseItemsTable.quantity),
        totalValue: sql<number>`sum(${warehouseItemsTable.quantity} * ${productsTable.price})`,
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
      .where(eq(warehousesTable.businessId, businessId));

    return { data: result[0].totalValue, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getInventoryValueByWarehouseAndProduct(
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
        totalValue: sql<number>`sum(${warehouseItemsTable.quantity} * ${productsTable.price})`,
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
