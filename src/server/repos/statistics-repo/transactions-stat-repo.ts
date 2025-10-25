"use cache";
import { and, asc, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  expensesTable,
  productsTable,
  transactionsTable,
  usersTable,
} from "@/lib/schema";
import type { TransactionType } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export const get_transaction_metrics_for_interval = async (
  businessId: string,
  dateFrom: Date,
  dateTo: Date,
) => {
  try {
    const result = await db
      .select({
        type: transactionsTable.type,
        quantity: transactionsTable.quantity,
        price: productsTable.price,
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
        eq(transactionsTable.productId, productsTable.id),
      );
    const expenseReq = await db
      .select({
        amount: expensesTable.amount,
        note: expensesTable.note,
      })
      .from(expensesTable)
      .where(
        and(
          eq(expensesTable.businessId, businessId),
          gte(expensesTable.createdAt, dateFrom),
          lte(expensesTable.createdAt, dateTo),
        ),
      );

    let totalSales = 0;
    let totalExpenses = 0;
    const transactionCount = result.length + expenseReq.length;

    result.forEach((transaction) => {
      const amount =
        Math.abs(transaction.quantity) * parseFloat(transaction.price);
      if (transaction.type === "SALE") {
        totalSales += amount;
      } else if (transaction.type === "PURCHASE") {
        totalExpenses += amount;
      }
    });
    expenseReq.forEach((expense) => {
      const amount = parseFloat(expense.amount);
      totalExpenses += amount;
    });

    const netProfit = totalSales - totalExpenses;

    return {
      data: {
        totalSales,
        totalExpenses,
        netProfit,
        transactionCount,
      },
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_filtered_transactions = async (
  businessId: string,
  limit = 10,
  offset = 0,
  sortBy: "createdAt" | "quantity",
  sortOrder: "asc" | "desc",
  typeFilter?: TransactionType,
  dateFrom?: Date,
  dateTo?: Date,
) => {
  try {
    const filters: SQL[] = [eq(transactionsTable.businessId, businessId)];

    if (typeFilter) {
      filters.push(eq(transactionsTable.type, typeFilter));
    }

    if (dateFrom) {
      filters.push(gte(transactionsTable.createdAt, dateFrom));
    }

    if (dateTo) {
      filters.push(lte(transactionsTable.createdAt, dateTo));
    }

    const orderBy =
      sortOrder === "desc"
        ? desc(transactionsTable[sortBy])
        : asc(transactionsTable[sortBy]);

    // filters.push(ilike(posts.title, 'AI'));
    // filters.push(inArray(posts.category, ['Tech', 'Art', 'Science']));
    // filters.push(gt(posts.views, 200));

    const transactions = await db
      .select()
      .from(transactionsTable)
      .innerJoin(
        productsTable,
        eq(transactionsTable.productId, productsTable.id),
      )
      //   .innerJoin(
      //     warehousesTable,
      //     eq(transactionsTable.warehouseId, warehousesTable.id)
      //   )
      .innerJoin(usersTable, eq(transactionsTable.createdBy, usersTable.id))
      .where(and(...filters))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return { data: transactions, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
