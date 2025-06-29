import { db } from "@/lib/db";
import {
  productsTable,
  transactionsTable,
  usersTable,
  //   warehousesTable,
} from "@/lib/schema";
import { TransactionType } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { and, asc, desc, eq, gte, lte, SQL } from "drizzle-orm";

export async function getTransactionMetricsForInterval(
  businessId: string,
  dateFrom: Date,
  dateTo: Date
) {
  try {
    const result = await db
      .select({
        type: transactionsTable.type,
        quantity: transactionsTable.quantity,
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          gte(transactionsTable.createdAt, dateFrom),
          lte(transactionsTable.createdAt, dateTo)
        )
      );

    let totalSales = 0;
    let totalExpenses = 0;
    const transactionCount = result.length;

    result.forEach((transaction) => {
      const amount = Math.abs(transaction.quantity);
      if (transaction.type === "SALE") {
        totalSales += amount;
      } else if (transaction.type === "PURCHASE") {
        totalExpenses += amount;
      }
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
}

export async function getFilteredTransactions(
  businessId: string,
  limit = 10,
  offset = 0,
  sortBy: "createdAt" | "quantity",
  sortOrder: "asc" | "desc",
  typeFilter?: TransactionType,
  dateFrom?: Date,
  dateTo?: Date
) {
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
        eq(transactionsTable.productId, productsTable.id)
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
}
