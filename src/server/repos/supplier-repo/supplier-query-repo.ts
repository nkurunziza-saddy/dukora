"use cache";

import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { suppliersTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const suppliers = await db
      .select()
      .from(suppliersTable)
      .where(
        and(
          eq(suppliersTable.businessId, businessId),
          isNull(suppliersTable.deletedAt),
        ),
      )
      .orderBy(desc(suppliersTable.createdAt));
    return { data: suppliers, error: null };
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
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
    const suppliers = await db
      .select()
      .from(suppliersTable)
      .where(
        and(
          eq(suppliersTable.businessId, businessId),
          isNull(suppliersTable.deletedAt),
        ),
      )
      .orderBy(desc(suppliersTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(suppliersTable)
      .where(
        and(
          eq(suppliersTable.businessId, businessId),
          isNull(suppliersTable.deletedAt),
        ),
      );

    return {
      data: { suppliers, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export async function get_by_id(supplierId: string, businessId: string) {
  if (!supplierId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const supplier = await db.query.suppliersTable.findFirst({
      where: and(
        eq(suppliersTable.id, supplierId),
        eq(suppliersTable.businessId, businessId),
      ),
      with: {
        productSuppliers: true,
      },
    });

    if (!supplier) {
      return {
        data: null,
        error: ErrorCode.SUPPLIER_NOT_FOUND,
      };
    }

    return { data: supplier, error: null };
  } catch (error) {
    console.error("Failed to fetch supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
