"use cache";

import { and, count, desc, eq, max, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessesTable, customerOrdersTable } from "@/lib/schema";
import { ERROR_CODE } from "../../constants/errors";

export const get_all = async () => {
  try {
    const res = await db
      .select()
      .from(businessesTable)
      .where(eq(businessesTable.isActive, true));
    return { data: res, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export async function get_by_id(businessId: string) {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const business = await db.query.businessesTable.findFirst({
      where: eq(businessesTable.id, businessId),
      with: {
        categories: true,
        businessSettings: true,
        warehouses: true,
      },
    });

    if (!business) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    return { data: business, error: null };
  } catch (error) {
    console.error("Failed to fetch business:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function get_by_id_minimized(businessId: string) {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const business = await db.query.businessesTable.findFirst({
      where: eq(businessesTable.id, businessId),
      columns: {
        name: true,
        createdAt: true,
      },
    });

    if (!business) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    return { data: business, error: null };
  } catch (error) {
    console.error("Failed to fetch business:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function get_popular(limit: number = 10) {
  try {
    const res = await db
      .select({
        business: businessesTable,
        orderCount: count(customerOrdersTable.id),
      })
      .from(businessesTable)
      .leftJoin(
        customerOrdersTable,
        and(
          eq(businessesTable.id, customerOrdersTable.businessId),
          notInArray(customerOrdersTable.status, ["DRAFT", "CANCELLED"])
        )
      )
      .where(eq(businessesTable.isActive, true))
      .groupBy(businessesTable.id)
      .orderBy(desc(count(customerOrdersTable.id)))
      .limit(limit);

    return { data: res.map((r) => r.business), error: null };
  } catch (error) {
    console.error("Failed to fetch popular businesses:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function get_recent(limit: number = 10) {
  try {
    const res = await db.query.businessesTable.findMany({
      where: eq(businessesTable.isActive, true),
      orderBy: (businesses, { desc }) => [desc(businesses.createdAt)],
      limit: limit,
    });

    return { data: res, error: null };
  } catch (error) {
    console.error("Failed to fetch recent businesses:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function get_user_recent(userId: string, limit: number = 10) {
  try {
    const sq = db
      .select({
        businessId: customerOrdersTable.businessId,
        lastOrderDate: max(customerOrdersTable.createdAt).as("last_order_date"),
      })
      .from(customerOrdersTable)
      .where(
        and(
          eq(customerOrdersTable.userId, userId),
          notInArray(customerOrdersTable.status, ["DRAFT", "CANCELLED"])
        )
      )
      .groupBy(customerOrdersTable.businessId)
      .as("sq");

    const res = await db
      .select({
        business: businessesTable,
        lastOrderDate: sq.lastOrderDate,
      })
      .from(businessesTable)
      .innerJoin(sq, eq(businessesTable.id, sq.businessId))
      .where(eq(businessesTable.isActive, true))
      .orderBy(desc(sq.lastOrderDate))
      .limit(limit);

    return { data: res.map((r) => r.business), error: null };
  } catch (error) {
    console.error("Failed to fetch user recent businesses:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function get_user_frequent(userId: string, limit: number = 10) {
  try {
    const res = await db
      .select({
        business: businessesTable,
        orderCount: count(customerOrdersTable.id),
      })
      .from(businessesTable)
      .innerJoin(
        customerOrdersTable,
        eq(businessesTable.id, customerOrdersTable.businessId)
      )
      .where(
        and(
          eq(businessesTable.isActive, true),
          eq(customerOrdersTable.userId, userId),
          notInArray(customerOrdersTable.status, ["DRAFT", "CANCELLED"])
        )
      )
      .groupBy(businessesTable.id)
      .orderBy(desc(count(customerOrdersTable.id)))
      .limit(limit);

    return { data: res.map((r) => r.business), error: null };
  } catch (error) {
    console.error("Failed to fetch user frequent businesses:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
