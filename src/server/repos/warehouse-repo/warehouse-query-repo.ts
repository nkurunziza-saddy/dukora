"use cache";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { warehousesTable } from "@/lib/schema";
import { ErrorCode } from "../../constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const warehouses = await db
      .select()
      .from(warehousesTable)
      .where(eq(warehousesTable.businessId, businessId))
      .orderBy(desc(warehousesTable.createdAt));
    return { data: warehouses, error: null };
  } catch (error) {
    console.error("Error getting warehouses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const offset = (page - 1) * pageSize;
    const warehouses = await db
      .select()
      .from(warehousesTable)
      .where(eq(warehousesTable.businessId, businessId))
      .orderBy(desc(warehousesTable.createdAt))
      .limit(pageSize)
      .offset(offset);
    const [totalCount] = await db
      .select({ count: count() })
      .from(warehousesTable)
      .where(eq(warehousesTable.businessId, businessId));
    return {
      data: { warehouses, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Error getting warehouses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_by_id = async (warehouseId: string, businessId: string) => {
  if (!warehouseId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const warehouse = await db.query.warehousesTable.findFirst({
      where: and(
        eq(warehousesTable.id, warehouseId),
        eq(warehousesTable.businessId, businessId),
      ),
      with: {
        transactions: true,
        warehouseItems: true,
      },
    });

    if (!warehouse) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: warehouse, error: null };
  } catch (error) {
    console.error("Error getting warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
