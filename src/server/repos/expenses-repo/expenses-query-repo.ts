"use cache";

import { and, count, desc, eq, getTableColumns, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { expensesTable, usersTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const expenseColumns = getTableColumns(expensesTable);
    const expenses = await db
      .select({
        ...expenseColumns,
        createdByUser: usersTable,
      })
      .from(expensesTable)
      .innerJoin(usersTable, eq(usersTable.id, expensesTable.createdBy))
      .where(eq(expensesTable.businessId, businessId))
      .orderBy(desc(expensesTable.createdAt));

    return { data: expenses, error: null };
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
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
    const expenseColumns = getTableColumns(expensesTable);
    const expenses = await db
      .select({
        ...expenseColumns,
        createdByUser: usersTable,
      })
      .from(expensesTable)
      .innerJoin(usersTable, eq(usersTable.id, expensesTable.createdBy))
      .where(eq(expensesTable.businessId, businessId))
      .orderBy(desc(expensesTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({
        count: count(),
      })
      .from(expensesTable)
      .innerJoin(usersTable, eq(usersTable.id, expensesTable.createdBy))
      .where(eq(expensesTable.businessId, businessId));

    return {
      data: { expenses, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
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
      .from(expensesTable)
      .where(
        and(
          eq(expensesTable.businessId, businessId),
          gte(expensesTable.createdAt, dateFrom),
          lte(expensesTable.createdAt, dateTo),
        ),
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

export async function get_by_id(expenseId: string, businessId: string) {
  if (!expenseId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const expense = await db.query.expensesTable.findFirst({
      where: and(
        eq(expensesTable.id, expenseId),
        eq(expensesTable.businessId, businessId),
      ),
      with: {
        createdByUser: true,
      },
    });

    if (!expense) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: expense, error: null };
  } catch (error) {
    console.error("Failed to fetch expense:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
