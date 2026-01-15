"use cache";

import { and, count, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  productsTable,
  storeProductsTable,
  warehouseItemsTable,
  warehousesTable,
} from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

export const get_admin_store_products = async (
  businessId: string,
  page: number,
  pageSize: number,
  filters?: {
    isPublished?: boolean;
    featured?: boolean;
    search?: string;
  },
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;
    const whereConditions = [
      eq(storeProductsTable.businessId, businessId),
      isNull(storeProductsTable.deletedAt),
    ];

    if (filters?.isPublished !== undefined) {
      whereConditions.push(
        eq(storeProductsTable.isPublished, filters.isPublished),
      );
    }

    if (filters?.featured !== undefined) {
      whereConditions.push(eq(storeProductsTable.featured, filters.featured));
    }

    if (filters?.search) {
      whereConditions.push(
        or(
          like(storeProductsTable.storeTitle, `%${filters.search}%`),
          like(productsTable.name, `%${filters.search}%`),
          like(productsTable.sku, `%${filters.search}%`),
          like(storeProductsTable.slug, `%${filters.search}%`),
        )!,
      );
    }

    const storeProducts = await db
      .select({
        storeProduct: storeProductsTable,
        product: productsTable,
        totalStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity}), 0)`,
        availableStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
      })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id),
      )
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId),
      )
      .where(and(...whereConditions))
      .groupBy(storeProductsTable.id, productsTable.id)
      .orderBy(desc(storeProductsTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id),
      )
      .where(and(...whereConditions));

    return {
      data: {
        storeProducts,
        totalCount: totalCount.count || 0,
        totalPages: Math.ceil((totalCount.count || 0) / pageSize),
        currentPage: page,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch admin store products:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_store_products_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
  filters?: {
    search?: string;
    tags?: string[];
    featured?: boolean;
    sortBy?: "viewCount" | "soldCount" | "storePrice" | "createdAt";
    sortOrder?: "asc" | "desc";
  },
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;
    const whereConditions = [
      eq(storeProductsTable.businessId, businessId),
      eq(storeProductsTable.isPublished, true),
      isNull(storeProductsTable.deletedAt),
      isNull(productsTable.deletedAt),
    ];

    if (filters?.search) {
      whereConditions.push(
        or(
          like(storeProductsTable.storeTitle, `%${filters.search}%`),
          like(storeProductsTable.storeDescription, `%${filters.search}%`),
          like(productsTable.name, `%${filters.search}%`),
        )!,
      );
    }

    if (filters?.featured !== undefined) {
      whereConditions.push(eq(storeProductsTable.featured, filters.featured));
    }

    // Determine sort order
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder || "desc";
    let orderByClause: any;

    switch (sortBy) {
      case "viewCount":
        orderByClause =
          sortOrder === "asc"
            ? storeProductsTable.viewCount
            : desc(storeProductsTable.viewCount);
        break;
      case "soldCount":
        orderByClause =
          sortOrder === "asc"
            ? storeProductsTable.soldCount
            : desc(storeProductsTable.soldCount);
        break;
      case "storePrice":
        orderByClause =
          sortOrder === "asc"
            ? storeProductsTable.storePrice
            : desc(storeProductsTable.storePrice);
        break;
      default:
        orderByClause =
          sortOrder === "asc"
            ? storeProductsTable.createdAt
            : desc(storeProductsTable.createdAt);
    }

    const storeProducts = await db
      .select({
        id: storeProductsTable.id,
        productId: storeProductsTable.productId,
        storeTitle: storeProductsTable.storeTitle,
        productName: productsTable.name,
        shortDescription: storeProductsTable.shortDescription,
        storePrice: storeProductsTable.storePrice,
        productPrice: productsTable.price,
        compareAtPrice: storeProductsTable.compareAtPrice,
        images: storeProductsTable.images,
        productImageUrl: productsTable.imageUrl,
        slug: storeProductsTable.slug,
        tags: storeProductsTable.tags,
        featured: storeProductsTable.featured,
        featuredOrder: storeProductsTable.featuredOrder,
        stockDisplay: storeProductsTable.stockDisplay,
        cachedStock: storeProductsTable.cachedStock,
        viewCount: storeProductsTable.viewCount,
        soldCount: storeProductsTable.soldCount,
        createdAt: storeProductsTable.createdAt,
      })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id),
      )
      .where(and(...whereConditions))
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id),
      )
      .where(and(...whereConditions));

    return {
      data: {
        products: storeProducts,
        totalCount: totalCount.count || 0,
        totalPages: Math.ceil((totalCount.count || 0) / pageSize),
        currentPage: page,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch store products:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get featured products for homepage
 */
export const get_featured_products = async (
  businessId: string,
  limit: number = 8,
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const products = await db
      .select({
        id: storeProductsTable.id,
        productId: storeProductsTable.productId,
        storeTitle: storeProductsTable.storeTitle,
        productName: productsTable.name,
        shortDescription: storeProductsTable.shortDescription,
        storePrice: storeProductsTable.storePrice,
        productPrice: productsTable.price,
        compareAtPrice: storeProductsTable.compareAtPrice,
        images: storeProductsTable.images,
        productImageUrl: productsTable.imageUrl,
        slug: storeProductsTable.slug,
        cachedStock: storeProductsTable.cachedStock,
        stockDisplay: storeProductsTable.stockDisplay,
        viewCount: storeProductsTable.viewCount,
        soldCount: storeProductsTable.soldCount,
      })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id),
      )
      .where(
        and(
          eq(storeProductsTable.businessId, businessId),
          eq(storeProductsTable.isPublished, true),
          eq(storeProductsTable.featured, true),
          isNull(storeProductsTable.deletedAt),
          isNull(productsTable.deletedAt),
        ),
      )
      .orderBy(
        storeProductsTable.featuredOrder,
        desc(storeProductsTable.createdAt),
      )
      .limit(limit);

    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get single store product by ID for admin
 */
export const get_store_product_by_id = async (
  storeProductId: string,
  businessId: string,
) => {
  if (!storeProductId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const [result] = await db
      .select({
        storeProduct: storeProductsTable,
        product: productsTable,
        totalStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity}), 0)`,
        availableStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
        warehouses: sql<any>`json_agg(json_build_object(
          'warehouseId', ${warehousesTable.id},
          'warehouseName', ${warehousesTable.name},
          'quantity', ${warehouseItemsTable.quantity},
          'reserved', ${warehouseItemsTable.reservedQty}
        ))`,
      })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id),
      )
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId),
      )
      .leftJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id),
      )
      .where(
        and(
          eq(storeProductsTable.id, storeProductId),
          eq(storeProductsTable.businessId, businessId),
        ),
      )
      .groupBy(storeProductsTable.id, productsTable.id);

    if (!result) {
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to fetch store product:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

/**
 * Get store product by slug for customer view
 */
export const get_store_product_by_slug = async (
  slug: string,
  businessId: string,
) => {
  if (!slug || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const [result] = await db
      .select({
        id: storeProductsTable.id,
        productId: storeProductsTable.productId,
        storeTitle: storeProductsTable.storeTitle,
        productName: productsTable.name,
        storeDescription: storeProductsTable.storeDescription,
        productDescription: productsTable.description,
        shortDescription: storeProductsTable.shortDescription,
        storePrice: storeProductsTable.storePrice,
        productPrice: productsTable.price,
        compareAtPrice: storeProductsTable.compareAtPrice,
        images: storeProductsTable.images,
        productImageUrl: productsTable.imageUrl,
        slug: storeProductsTable.slug,
        tags: storeProductsTable.tags,
        stockDisplay: storeProductsTable.stockDisplay,
        cachedStock: storeProductsTable.cachedStock,
        unit: productsTable.unit,
        sku: productsTable.sku,
        viewCount: storeProductsTable.viewCount,
        soldCount: storeProductsTable.soldCount,
        totalStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity}), 0)`,
        availableStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
      })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id),
      )
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId),
      )
      .where(
        and(
          eq(storeProductsTable.slug, slug),
          eq(storeProductsTable.businessId, businessId),
          eq(storeProductsTable.isPublished, true),
          isNull(storeProductsTable.deletedAt),
          isNull(productsTable.deletedAt),
        ),
      )
      .groupBy(storeProductsTable.id, productsTable.id);

    if (!result) {
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to fetch store product by slug:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_available_inventory_products = async (
  businessId: string,
  page: number,
  pageSize: number,
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;

    const products = await db
      .select({
        product: productsTable,
        totalStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity}), 0)`,
        availableStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
      })
      .from(productsTable)
      .leftJoin(
        storeProductsTable,
        eq(productsTable.id, storeProductsTable.productId),
      )
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId),
      )
      .where(
        and(
          eq(productsTable.businessId, businessId),
          isNull(productsTable.deletedAt),
          isNull(storeProductsTable.id),
        ),
      )
      .groupBy(productsTable.id)
      .orderBy(desc(productsTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(productsTable)
      .leftJoin(
        storeProductsTable,
        eq(productsTable.id, storeProductsTable.productId),
      )
      .where(
        and(
          eq(productsTable.businessId, businessId),
          isNull(productsTable.deletedAt),
          isNull(storeProductsTable.id),
        ),
      );

    return {
      data: {
        products,
        totalCount: totalCount.count || 0,
        totalPages: Math.ceil((totalCount.count || 0) / pageSize),
        currentPage: page,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch available inventory products:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const check_product_availability = async (
  storeProductId: string,
  quantity: number,
) => {
  if (!storeProductId || quantity <= 0) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const [result] = await db
      .select({
        storeProductId: storeProductsTable.id,
        productId: storeProductsTable.productId,
        isPublished: storeProductsTable.isPublished,
        cachedStock: storeProductsTable.cachedStock,
        actualStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
      })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id),
      )
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId),
      )
      .where(eq(storeProductsTable.id, storeProductId))
      .groupBy(storeProductsTable.id, productsTable.id);

    if (!result) {
      return {
        data: { available: false, reason: "Product not found" },
        error: null,
      };
    }

    if (!result.isPublished) {
      return {
        data: { available: false, reason: "Product not published" },
        error: null,
      };
    }

    const available = Number(result.actualStock) >= quantity;

    return {
      data: {
        available,
        availableQuantity: Number(result.actualStock),
        requestedQuantity: quantity,
        reason: available ? null : "Insufficient stock",
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to check product availability:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
