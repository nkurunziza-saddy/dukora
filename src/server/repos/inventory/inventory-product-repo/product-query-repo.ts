"use cache";

import { and, count, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categoriesTable,
  productsTable,
  storeProductsTable,
  warehouseItemsTable,
  warehousesTable,
} from "@/lib/schema";
import { ERROR_CODE } from "@/server/constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.businessId, businessId),
          isNull(productsTable.deletedAt)
        )
      )
      .orderBy(desc(productsTable.createdAt));

    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;
    const products = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.businessId, businessId),
          isNull(productsTable.deletedAt)
        )
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
          isNull(productsTable.deletedAt)
        )
      );

    return {
      data: { products, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_overview = async (businessId: string, limit?: number) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const query = db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.businessId, businessId),
          isNull(productsTable.deletedAt)
        )
      )
      .orderBy(desc(productsTable.createdAt))
      .innerJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId)
      )
      .innerJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id)
      )
      .innerJoin(
        warehousesTable,
        eq(warehouseItemsTable.warehouseId, warehousesTable.id)
      );

    const products = await (limit ? query.limit(limit) : query);
    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export async function get_by_id(productId: string, businessId: string) {
  if (!productId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const product = await db.query.productsTable.findFirst({
      where: and(
        eq(productsTable.id, productId),
        eq(productsTable.businessId, businessId)
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
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    return { data: product, error: null };
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

// store (public, no auth required)
export interface StoreProductFilters {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export const get_products_for_store = async (
  businessId: string,
  filters: StoreProductFilters,
  featured?: boolean,
  isPublished?: boolean
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }
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

    const whereConditions = [
      eq(productsTable.status, "ACTIVE"),
      eq(storeProductsTable.businessId, businessId),
      isNull(productsTable.deletedAt),
    ];

    if (isPublished !== undefined) {
      whereConditions.push(eq(storeProductsTable.isPublished, isPublished));
    }

    if (featured !== undefined) {
      whereConditions.push(eq(storeProductsTable.featured, featured));
    }

    if (search) {
      whereConditions.push(
        or(
          like(storeProductsTable.storeTitle, `%${search}%`),
          like(storeProductsTable.slug, `%${search}%`),
          like(productsTable.name, `%${search}%`),
          like(productsTable.description, `%${search}%`),
          like(productsTable.sku, `%${search}%`)
        )!
      );
    }

    if (category) {
      whereConditions.push(eq(categoriesTable.id, category));
    }

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
      default:
        orderBy =
          sortOrder === "asc" ? productsTable.name : desc(productsTable.name);
    }

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
        totalStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity}), 0)`,
        availableStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
        categoryValue: categoriesTable.value,
        categoryDescription: categoriesTable.description,
      })
      .from(productsTable)
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId)
      )
      .leftJoin(
        storeProductsTable,
        eq(productsTable.id, storeProductsTable.productId)
      )
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id)
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
        categoriesTable.description
      )
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(productsTable)
      .leftJoin(
        storeProductsTable,
        eq(productsTable.id, storeProductsTable.productId)
      )
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id)
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
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_product_by_id_for_store = async (
  businessId: string,
  productId: string
) => {
  if (!productId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
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
        totalStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity}), 0)`,
        availableStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
        categoryValue: categoriesTable.value,
        categoryDescription: categoriesTable.description,
      })
      .from(productsTable)
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId)
      )
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id)
      )
      .where(
        and(
          eq(productsTable.id, productId),
          eq(productsTable.businessId, businessId),
          eq(productsTable.status, "ACTIVE"),
          isNull(productsTable.deletedAt)
        )
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
        categoriesTable.description
      );

    if (!product) {
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    return { data: product, error: null };
  } catch (error) {
    console.error("Failed to fetch product for store:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const get_categories_for_store = async ({
  businessId,
}: {
  businessId: string;
}) => {
  try {
    const categories = await db
      .select({
        id: categoriesTable.id,
        value: categoriesTable.value,
        description: categoriesTable.description,
        productCount: sql<number>`COUNT(DISTINCT ${storeProductsTable.id})`,
      })
      .from(categoriesTable)
      .leftJoin(productsTable, eq(categoriesTable.id, productsTable.categoryId))
      .leftJoin(
        storeProductsTable,
        and(
          eq(productsTable.id, storeProductsTable.productId),
          eq(storeProductsTable.businessId, businessId),
          eq(storeProductsTable.isPublished, true)
        )
      )
      .where(
        and(
          eq(categoriesTable.isActive, true),
          eq(categoriesTable.businessId, businessId),
          eq(productsTable.status, "ACTIVE"),
          isNull(productsTable.deletedAt)
        )
      )
      .groupBy(
        categoriesTable.id,
        categoriesTable.value,
        categoriesTable.description
      )
      .orderBy(categoriesTable.value);

    return { data: categories, error: null };
  } catch (error) {
    console.error("Failed to fetch categories for store:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const search_products_globally = async (
  query: string,
  limit: number = 5
) => {
  if (!query || query.trim().length === 0) {
    return { data: [], error: null };
  }

  try {
    const searchTerm = `%${query.trim()}%`;

    const results = await db
      .select({
        id: storeProductsTable.id,
        name: sql<string>`COALESCE(${storeProductsTable.storeTitle}, ${productsTable.name})`,
        description: sql<string>`COALESCE(${storeProductsTable.storeDescription}, ${productsTable.description})`,
        price: sql<string>`COALESCE(${storeProductsTable.storePrice}, ${productsTable.price})`,
        currency: productsTable.currency,
        imageUrl: productsTable.imageUrl,
        businessId: storeProductsTable.businessId,
        businessName: sql<string>`businesses.name`,
        businessLogoUrl: sql<string>`businesses.logo_url`,
      })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id)
      )
      .innerJoin(
        sql`businesses`,
        sql`businesses.id = ${storeProductsTable.businessId}`
      )
      .where(
        and(
          eq(storeProductsTable.isPublished, true),
          isNull(productsTable.deletedAt),
          sql`businesses.is_active = true`,
          or(
            like(
              sql`COALESCE(${storeProductsTable.storeTitle}, ${productsTable.name})`,
              searchTerm
            ),
            like(
              sql`COALESCE(${storeProductsTable.storeDescription}, ${productsTable.description})`,
              searchTerm
            )
          )
        )
      )
      .limit(limit);

    return { data: results, error: null };
  } catch (error) {
    console.error("Failed to search products globally:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};
