"use cache";

import { and, asc, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { suppliersTable } from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
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
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
  sorting?: { id: string; desc: boolean }[],
  search?: string,
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;

    const whereConditions: any[] = [
      eq(suppliersTable.businessId, businessId),
      isNull(suppliersTable.deletedAt),
    ];

    if (search) {
      whereConditions.push(
        or(
          ilike(suppliersTable.name, `%${search}%`),
          ilike(suppliersTable.email, `%${search}%`),
          ilike(suppliersTable.phone, `%${search}%`),
          ilike(suppliersTable.address, `%${search}%`),
        ),
      );
    }

    let orderBy: any = desc(suppliersTable.createdAt);
    if (sorting && sorting.length > 0) {
      const sort = sorting[0];
      const columnMap: Record<string, any> = {
        name: suppliersTable.name,
        email: suppliersTable.email,
        createdAt: suppliersTable.createdAt,
      };

      const column = columnMap[sort.id];
      if (column) {
        orderBy = sort.desc ? desc(column) : asc(column);
      }
    }

    const suppliers = await db
      .select()
      .from(suppliersTable)
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(suppliersTable)
      .where(and(...whereConditions));

    return {
      data: { suppliers, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export async function get_by_id(supplierId: string, businessId: string) {
  if (!supplierId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
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
        error: ERROR_CODE.SUPPLIER_NOT_FOUND,
      };
    }

    return { data: supplier, error: null };
  } catch (error) {
    console.error("Failed to fetch supplier:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
