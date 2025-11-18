"use cache";

import { and, count, desc, eq, isNull, like, or, sql } from "drizzle-orm";
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

// Store-specific functions (public, no auth required)
export interface StoreProductFilters {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export const get_products_for_store = async (filters: StoreProductFilters) => {
  try {
    const {
      page,
      pageSize,
      search,
      category,
      sortBy = "name",
      sortOrder = "asc",
    } = filters;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions = [
      eq(productsTable.status, "ACTIVE"),
      isNull(productsTable.deletedAt),
    ];

    // Add search condition
    if (search) {
      whereConditions.push(
        or(
          like(productsTable.name, `%${search}%`),
          like(productsTable.description, `%${search}%`),
          like(productsTable.sku, `%${search}%`),
        )!,
      );
    }

    // Add category condition
    if (category) {
      whereConditions.push(eq(categoriesTable.value, category));
    }

    // Build order by
    let orderBy: any;
    switch (sortBy) {
      case "price":
        orderBy =
          sortOrder === "asc" ? productsTable.price : desc(productsTable.price);
        break;
      case "createdAt":
        orderBy =
          sortOrder === "asc"
            ? productsTable.createdAt
            : desc(productsTable.createdAt);
        break;
      default: // name
        orderBy =
          sortOrder === "asc" ? productsTable.name : desc(productsTable.name);
    }

    // Query products with stock information
    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        sku: productsTable.sku,
        price: productsTable.price,
        costPrice: productsTable.costPrice,
        imageUrl: productsTable.imageUrl,
        status: productsTable.status,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
        // Stock information
        totalStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity}), 0)`,
        availableStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
        // Category information
        categoryValue: categoriesTable.value,
        categoryDescription: categoriesTable.description,
      })
      .from(productsTable)
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId),
      )
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id),
      )
      .where(and(...whereConditions))
      .groupBy(
        productsTable.id,
        productsTable.name,
        productsTable.description,
        productsTable.sku,
        productsTable.price,
        productsTable.costPrice,
        productsTable.imageUrl,
        productsTable.status,
        productsTable.createdAt,
        productsTable.updatedAt,
        categoriesTable.value,
        categoriesTable.description,
      )
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const [totalCount] = await db
      .select({ count: count() })
      .from(productsTable)
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id),
      )
      .where(and(...whereConditions));

    const totalPages = Math.ceil((totalCount.count || 0) / pageSize);

    return {
      data: {
        products,
        totalCount: totalCount.count || 0,
        totalPages,
        currentPage: page,
        pageSize,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch products for store:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_product_by_id_for_store = async (productId: string) => {
  if (!productId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const [product] = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        sku: productsTable.sku,
        price: productsTable.price,
        costPrice: productsTable.costPrice,
        imageUrl: productsTable.imageUrl,
        status: productsTable.status,
        unit: productsTable.unit,
        weight: productsTable.weight,
        length: productsTable.length,
        width: productsTable.width,
        height: productsTable.height,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
        // Stock information
        totalStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity}), 0)`,
        availableStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
        // Category information
        categoryValue: categoriesTable.value,
        categoryDescription: categoriesTable.description,
      })
      .from(productsTable)
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId),
      )
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id),
      )
      .where(
        and(
          eq(productsTable.id, productId),
          eq(productsTable.status, "ACTIVE"),
          isNull(productsTable.deletedAt),
        ),
      )
      .groupBy(
        productsTable.id,
        productsTable.name,
        productsTable.description,
        productsTable.sku,
        productsTable.price,
        productsTable.costPrice,
        productsTable.imageUrl,
        productsTable.status,
        productsTable.unit,
        productsTable.weight,
        productsTable.length,
        productsTable.width,
        productsTable.height,
        productsTable.createdAt,
        productsTable.updatedAt,
        categoriesTable.value,
        categoriesTable.description,
      );

    if (!product) {
      return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
    }

    return { data: product, error: null };
  } catch (error) {
    console.error("Failed to fetch product for store:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_categories_for_store = async () => {
  try {
    const categories = await db
      .select({
        id: categoriesTable.id,
        value: categoriesTable.value,
        description: categoriesTable.description,
        productCount: sql<number>`COUNT(${productsTable.id})`,
      })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(categoriesTable.id, productsTable.categoryId))
      .where(
        and(
          eq(categoriesTable.isActive, true),
          eq(productsTable.status, "ACTIVE"),
          isNull(productsTable.deletedAt),
        ),
      )
      .groupBy(
        categoriesTable.id,
        categoriesTable.value,
        categoriesTable.description,
      )
      .orderBy(categoriesTable.value);

    return { data: categories, error: null };
  } catch (error) {
    console.error("Failed to fetch categories for store:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
