"use cache";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { productsTable, transactionsTable, usersTable } from "@/lib/schema";
import { TransactionType } from "@/lib/schema/schema.types";
import { ERROR_CODE } from "@/server/constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
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
        eq(productsTable.id, transactionsTable.productId)
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy))
      .orderBy(desc(transactionsTable.createdAt));

    return { data: transactions, error: null };
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
  sorting?: { id: string; desc: boolean }[],
  filters?: { id: string; value: unknown }[],
  search?: string
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;

    // Build where clause
    const whereConditions = [eq(transactionsTable.businessId, businessId)];

    if (filters) {
      filters.forEach((filter) => {
        if (filter.id === "type" && filter.value) {
          const types = Array.isArray(filter.value)
            ? filter.value
            : (filter.value as string).split(",");

          // Cast to TransactionType[]
          const validTypes = types.filter((t: any) =>
            Object.values(TransactionType).includes(t as TransactionType)
          ) as TransactionType[];

          if (validTypes.length > 0) {
            whereConditions.push(inArray(transactionsTable.type, validTypes));
          }
        }
      });
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(transactionsTable.reference, `%${search}%`),
          ilike(transactionsTable.note, `%${search}%`),
          ilike(productsTable.name, `%${search}%`),
          ilike(usersTable.name, `%${search}%`)
        )
      );
    }

    // Build order by
    let orderBy: any = desc(transactionsTable.createdAt);
    if (sorting && sorting.length > 0) {
      const sort = sorting[0];
      // Map sort.id to table columns
      const columnMap: Record<string, any> = {
        createdAt: transactionsTable.createdAt,
        quantity: transactionsTable.quantity,
        // Add other sortable columns
      };

      const column = columnMap[sort.id];
      if (column) {
        orderBy = sort.desc ? desc(column) : asc(column); // Need to import asc
      }
    }

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
      .where(and(...whereConditions)) // Need to spread conditions
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId)
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy))
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(transactionsTable)
      .where(and(...whereConditions))
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId)
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy));

    return {
      data: { transactions, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export async function get_by_time_interval(
  businessId: string,
  dateFrom: Date,
  dateTo: Date
) {
  try {
    const result = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          gte(transactionsTable.createdAt, dateFrom),
          lte(transactionsTable.createdAt, dateTo)
        )
      )
      .innerJoin(
        productsTable,
        eq(transactionsTable.productId, productsTable.id)
      );
    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
export async function get_time_interval_with_with(
  businessId: string,
  dateFrom: Date,
  dateTo: Date
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
          lte(transactionsTable.createdAt, dateTo)
        )
      )
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId)
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy))
      .orderBy(desc(transactionsTable.createdAt));

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function get_time_interval_with_with_paginated(
  businessId: string,
  dateFrom: Date,
  dateTo: Date,
  page: number,
  pageSize: number
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
          lte(transactionsTable.createdAt, dateTo)
        )
      )
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId)
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
          lte(transactionsTable.createdAt, dateTo)
        )
      )
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId)
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy));
    return {
      data: { result, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function get_by_id(transactionId: string, businessId: string) {
  if (!transactionId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const transaction = await db.query.transactionsTable.findFirst({
      where: and(
        eq(transactionsTable.id, transactionId),
        eq(transactionsTable.businessId, businessId)
      ),
      with: {
        product: true,
        warehouse: true,
        warehouseItem: true,
      },
    });

    if (!transaction) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    return { data: transaction, error: null };
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function get_by_type(businessId: string, type: TransactionType) {
  if (!businessId || !type) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          eq(transactionsTable.type, type)
        )
      )
      .orderBy(desc(transactionsTable.createdAt));

    return { data: transactions, error: null };
  } catch (error) {
    console.error("Failed to fetch transactions by type:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
