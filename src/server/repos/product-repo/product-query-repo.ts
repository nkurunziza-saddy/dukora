"use cache";

import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categoriesTable,
  productsTable,
  warehouseItemsTable,
  warehousesTable,
} from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.businessId, businessId),
          isNull(productsTable.deletedAt),
        ),
      )
      .orderBy(desc(productsTable.createdAt));

    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to fetch products:", error);
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
    const products = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.businessId, businessId),
          isNull(productsTable.deletedAt),
        ),
      )
      .orderBy(desc(productsTable.createdAt))
      .limit(pageSize)
      .offset(offset);
    const [totalCount] = await db
      .select({ count: count() })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.businessId, businessId),
          isNull(productsTable.deletedAt),
        ),
      );

    return {
      data: { products, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_overview = async (businessId: string, limit?: number) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const query = db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.businessId, businessId),
          isNull(productsTable.deletedAt),
        ),
      )
      .orderBy(desc(productsTable.createdAt))
      .innerJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId),
      )
      .innerJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id),
      )
      .innerJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id),
      );

    const products = await (limit ? query.limit(limit) : query);
    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export async function get_by_id(productId: string, businessId: string) {
  if (!productId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const product = await db.query.productsTable.findFirst({
      where: and(
        eq(productsTable.id, productId),
        eq(productsTable.businessId, businessId),
      ),
      with: {
        category: true,
        productVariants: true,
        transactions: true,
        productSuppliers: true,
        warehouseItems: {
          with: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
    }

    return { data: product, error: null };
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
