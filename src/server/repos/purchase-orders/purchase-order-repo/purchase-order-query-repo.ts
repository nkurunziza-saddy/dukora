"use cache";

import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { purchaseOrdersTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
  search?: string,
  status?: string,
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;

    const whereConditions = [eq(purchaseOrdersTable.businessId, businessId)];

    if (search) {
      whereConditions.push(
        or(like(purchaseOrdersTable.orderNumber, `%${search}%`))!,
      );
    }

    if (status) {
      // TODO: Remove any
      whereConditions.push(eq(purchaseOrdersTable.status, status as any));
    }

    const [orders, totalCountResult] = await Promise.all([
      db
        .select()
        .from(purchaseOrdersTable)
        .where(and(...whereConditions))
        .orderBy(desc(purchaseOrdersTable.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(purchaseOrdersTable)
        .where(and(...whereConditions)),
    ]);

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      data: {
        orders,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get paginated purchase orders:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_by_id = async (orderId: string) => {
  if (!orderId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const order = await db
      .select()
      .from(purchaseOrdersTable)
      .where(eq(purchaseOrdersTable.id, orderId))
      .limit(1);

    if (!order[0]) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: order[0], error: null };
  } catch (error) {
    console.error("Failed to get purchase order by id:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
