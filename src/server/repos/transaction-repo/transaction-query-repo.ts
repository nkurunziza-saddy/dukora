"use cache";

import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { productsTable, transactionsTable, usersTable } from "@/lib/schema";
import type { TransactionType } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transactions = await db
      .select({
        type: transactionsTable.type,
        quantity: transactionsTable.quantity,
        reference: transactionsTable.reference,
        note: transactionsTable.note,
        createdAt: transactionsTable.createdAt,
        product: productsTable.name,
        createdBy: usersTable.name,
      })
      .from(transactionsTable)
      .where(eq(transactionsTable.businessId, businessId))
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId),
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy))
      .orderBy(desc(transactionsTable.createdAt));

    return { data: transactions, error: null };
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
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
    const transactions = await db
      .select({
        type: transactionsTable.type,
        quantity: transactionsTable.quantity,
        reference: transactionsTable.reference,
        note: transactionsTable.note,
        createdAt: transactionsTable.createdAt,
        product: productsTable.name,
        createdBy: usersTable.name,
      })
      .from(transactionsTable)
      .where(eq(transactionsTable.businessId, businessId))
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId),
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(transactionsTable)
      .where(eq(transactionsTable.businessId, businessId))
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId),
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy));

    return {
      data: { transactions, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export async function get_by_time_interval(
  businessId: string,
  dateFrom: Date,
  dateTo: Date,
) {
  try {
    const result = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          gte(transactionsTable.createdAt, dateFrom),
          lte(transactionsTable.createdAt, dateTo),
        ),
      )
      .innerJoin(
        productsTable,
        eq(transactionsTable.productId, productsTable.id),
      );
    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
export async function get_time_interval_with_with(
  businessId: string,
  dateFrom: Date,
  dateTo: Date,
) {
  try {
    const result = await db
      .select({
        type: transactionsTable.type,
        quantity: transactionsTable.quantity,
        reference: transactionsTable.reference,
        note: transactionsTable.note,
        createdAt: transactionsTable.createdAt,
        product: productsTable.name,
        createdBy: usersTable.name,
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          gte(transactionsTable.createdAt, dateFrom),
          lte(transactionsTable.createdAt, dateTo),
        ),
      )
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId),
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy))
      .orderBy(desc(transactionsTable.createdAt));

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_time_interval_with_with_paginated(
  businessId: string,
  dateFrom: Date,
  dateTo: Date,
  page: number,
  pageSize: number,
) {
  try {
    const offset = (page - 1) * pageSize;
    const result = await db
      .select({
        type: transactionsTable.type,
        quantity: transactionsTable.quantity,
        reference: transactionsTable.reference,
        note: transactionsTable.note,
        createdAt: transactionsTable.createdAt,
        product: productsTable.name,
        createdBy: usersTable.name,
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          gte(transactionsTable.createdAt, dateFrom),
          lte(transactionsTable.createdAt, dateTo),
        ),
      )
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId),
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(pageSize)
      .offset(offset);
    const [totalCount] = await db
      .select({
        count: count(),
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          gte(transactionsTable.createdAt, dateFrom),
          lte(transactionsTable.createdAt, dateTo),
        ),
      )
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId),
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy));
    return {
      data: { result, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_by_id(transactionId: string, businessId: string) {
  if (!transactionId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transaction = await db.query.transactionsTable.findFirst({
      where: and(
        eq(transactionsTable.id, transactionId),
        eq(transactionsTable.businessId, businessId),
      ),
      with: {
        product: true,
        warehouse: true,
        warehouseItem: true,
      },
    });

    if (!transaction) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: transaction, error: null };
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_by_type(businessId: string, type: TransactionType) {
  if (!businessId || !type) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          eq(transactionsTable.type, type),
        ),
      )
      .orderBy(desc(transactionsTable.createdAt));

    return { data: transactions, error: null };
  } catch (error) {
    console.error("Failed to fetch transactions by type:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
