"use cache";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  productsTable,
  warehouseItemsTable,
  warehousesTable,
} from "@/lib/schema";
import { ErrorCode } from "../../constants/errors";

export const get_all = async (warehouseId: string) => {
  try {
    const items = await db
      .select()
      .from(warehouseItemsTable)
      .where(eq(warehouseItemsTable.warehouseId, warehouseId));
    return { data: items, error: null };
  } catch (error) {
    console.error("Error getting warehouse items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_all_paginated = async (
  warehouseId: string,
  page: number,
  pageSize: number,
) => {
  try {
    const offset = (page - 1) * pageSize;
    const items = await db
      .select()
      .from(warehouseItemsTable)
      .where(eq(warehouseItemsTable.warehouseId, warehouseId))
      .limit(pageSize)
      .offset(offset);
    const [totalCount] = await db
      .select({ count: count() })
      .from(warehouseItemsTable)
      .where(eq(warehouseItemsTable.warehouseId, warehouseId));

    return {
      data: { items, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Error getting warehouse items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export async function get_all_by_business_id(businessId: string) {
  try {
    const items = await db
      .select({
        warehouseItem: warehouseItemsTable,
        product: productsTable,
      })
      .from(warehousesTable)
      .innerJoin(
        warehouseItemsTable,
        eq(warehousesTable.id, warehouseItemsTable.warehouseId),
      )
      .innerJoin(
        productsTable,
        eq(warehouseItemsTable.productId, productsTable.id),
      )
      .where(eq(warehousesTable.businessId, businessId));
    return { data: items, error: null };
  } catch (error) {
    console.error("Error getting warehouse items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_by_id(warehouseItemId: string) {
  try {
    const warehouseItem = await db.query.warehouseItemsTable.findFirst({
      where: and(eq(warehouseItemsTable.id, warehouseItemId)),
      with: {
        warehouse: true,
      },
    });

    if (!warehouseItem) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: warehouseItem, error: null };
  } catch (error) {
    console.error("Error getting warehouseItem:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
