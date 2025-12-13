"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  auditLogsTable,
  productsTable,
  storeProductsTable,
  warehouseItemsTable,
} from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertStoreProduct,
} from "@/lib/schema/schema.types";
import { ERROR_CODE } from "@/server/constants/errors";

/**
 * Generate URL-friendly slug from product name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ensure slug is unique within business
 */
async function ensureUniqueSlug(
  slug: string,
  businessId: string,
  excludeId?: string
): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existing = await db.query.storeProductsTable.findFirst({
      where: and(
        eq(storeProductsTable.slug, uniqueSlug),
        eq(storeProductsTable.businessId, businessId),
        excludeId ? sql`${storeProductsTable.id} != ${excludeId}` : undefined
      ),
    });

    if (!existing) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

async function syncCachedStock(productId: string): Promise<number> {
  const [result] = await db
    .select({
      totalStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
    })
    .from(warehouseItemsTable)
    .where(eq(warehouseItemsTable.productId, productId));

  return Number(result?.totalStock || 0);
}

export async function publish_product(
  productId: string,
  businessId: string,
  userId: string,
  options?: {
    storePrice?: number;
    compareAtPrice?: number;
    storeTitle?: string;
    storeDescription?: string;
    shortDescription?: string;
    images?: string[];
    tags?: string[];
    featured?: boolean;
    featuredOrder?: number;
  }
) {
  if (!productId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const product = await db.query.productsTable.findFirst({
      where: and(
        eq(productsTable.id, productId),
        eq(productsTable.businessId, businessId),
        isNull(productsTable.deletedAt)
      ),
    });

    if (!product) {
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    const existing = await db.query.storeProductsTable.findFirst({
      where: and(
        eq(storeProductsTable.productId, productId),
        eq(storeProductsTable.businessId, businessId)
      ),
    });

    if (existing) {
      return { data: null, error: ERROR_CODE.PRODUCT_ALREADY_PUBLISHED };
    }

    const result = await db.transaction(async (tx) => {
      // Generate slug
      const title = options?.storeTitle || product.name;
      const baseSlug = generateSlug(title);
      const uniqueSlug = await ensureUniqueSlug(baseSlug, businessId);

      const cachedStock = await syncCachedStock(productId);

      const storeProductData: InsertStoreProduct = {
        productId,
        businessId,
        isPublished: true,
        publishedAt: new Date(),
        storePrice: options?.storePrice?.toString(),
        compareAtPrice: options?.compareAtPrice?.toString(),
        storeTitle: options?.storeTitle,
        storeDescription: options?.storeDescription,
        shortDescription: options?.shortDescription,
        images: options?.images ? options.images : null,
        slug: uniqueSlug,
        tags: options?.tags ? options.tags : null,
        featured: options?.featured || false,
        featuredOrder: options?.featuredOrder,
        cachedStock,
      };

      const [newStoreProduct] = await tx
        .insert(storeProductsTable)
        .values(storeProductData)
        .returning();

      const auditData: InsertAuditLog = {
        businessId,
        model: "store_product",
        recordId: newStoreProduct.id,
        action: "publish-product",
        changes: JSON.stringify({ productId, options }),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return newStoreProduct;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to publish product:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Unpublish a product from the store (soft delete)
 */
export async function unpublish_product(
  storeProductId: string,
  businessId: string,
  userId: string
) {
  if (!storeProductId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [unpublished] = await tx
        .update(storeProductsTable)
        .set({
          isPublished: false,
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(storeProductsTable.id, storeProductId),
            eq(storeProductsTable.businessId, businessId)
          )
        )
        .returning();

      if (!unpublished) return null;

      const auditData: InsertAuditLog = {
        businessId,
        model: "store_product",
        recordId: storeProductId,
        action: "unpublish-product",
        changes: JSON.stringify({ unpublished: true }),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return unpublished;
    });

    if (!result) {
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to unpublish product:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Update store product fields
 */
export async function update_store_product(
  storeProductId: string,
  businessId: string,
  userId: string,
  updates: Partial<InsertStoreProduct>
) {
  if (!storeProductId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // If updating title, regenerate slug
      if (updates.storeTitle) {
        const baseSlug = generateSlug(updates.storeTitle);
        updates.slug = await ensureUniqueSlug(
          baseSlug,
          businessId,
          storeProductId
        );
      }

      const [updated] = await tx
        .update(storeProductsTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(
            eq(storeProductsTable.id, storeProductId),
            eq(storeProductsTable.businessId, businessId)
          )
        )
        .returning();

      if (!updated) return null;

      const auditData: InsertAuditLog = {
        businessId,
        model: "store_product",
        recordId: storeProductId,
        action: "update-store-product",
        changes: JSON.stringify(updates),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return updated;
    });

    if (!result) {
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to update store product:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Bulk publish products
 */
export async function bulk_publish_products(
  productIds: string[],
  businessId: string,
  userId: string,
  options?: {
    featured?: boolean;
  }
) {
  if (!productIds.length || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const results = await db.transaction(async (tx) => {
      const published = [];

      for (const productId of productIds) {
        // Check if product exists
        const product = await tx.query.productsTable.findFirst({
          where: and(
            eq(productsTable.id, productId),
            eq(productsTable.businessId, businessId),
            isNull(productsTable.deletedAt)
          ),
        });

        if (!product) continue;

        // Check if already published
        const existing = await tx.query.storeProductsTable.findFirst({
          where: and(
            eq(storeProductsTable.productId, productId),
            eq(storeProductsTable.businessId, businessId)
          ),
        });

        if (existing) continue;

        // Generate slug
        const baseSlug = generateSlug(product.name);
        const uniqueSlug = await ensureUniqueSlug(baseSlug, businessId);

        // Get cached stock
        const cachedStock = await syncCachedStock(productId);

        // Create store product
        const [storeProduct] = await tx
          .insert(storeProductsTable)
          .values({
            productId,
            businessId,
            isPublished: true,
            publishedAt: new Date(),
            slug: uniqueSlug,
            featured: options?.featured || false,
            cachedStock,
          })
          .returning();

        published.push(storeProduct);
      }

      // Audit log
      const auditData: InsertAuditLog = {
        businessId,
        model: "store_product",
        recordId: "bulk",
        action: "bulk-publish-products",
        changes: JSON.stringify({ productIds, count: published.length }),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return published;
    });

    return { data: results, error: null };
  } catch (error) {
    console.error("Failed to bulk publish products:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Update product images
 */
export async function update_product_images(
  storeProductId: string,
  businessId: string,
  images: string[]
) {
  if (!storeProductId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const [updated] = await db
      .update(storeProductsTable)
      .set({
        images: images,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(storeProductsTable.id, storeProductId),
          eq(storeProductsTable.businessId, businessId)
        )
      )
      .returning();

    if (!updated) {
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    return { data: updated, error: null };
  } catch (error) {
    console.error("Failed to update product images:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Increment view count
 */
export async function increment_view_count(storeProductId: string) {
  if (!storeProductId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    await db
      .update(storeProductsTable)
      .set({
        viewCount: sql`${storeProductsTable.viewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(storeProductsTable.id, storeProductId));

    return { data: true, error: null };
  } catch (error) {
    console.error("Failed to increment view count:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Increment sold count
 */
export async function increment_sold_count(
  storeProductId: string,
  quantity: number = 1
) {
  if (!storeProductId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    await db
      .update(storeProductsTable)
      .set({
        soldCount: sql`${storeProductsTable.soldCount} + ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(storeProductsTable.id, storeProductId));

    return { data: true, error: null };
  } catch (error) {
    console.error("Failed to increment sold count:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Update cached stock for a store product
 */
export async function update_cached_stock(
  storeProductId: string,
  businessId: string
) {
  if (!storeProductId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    // Get the product ID
    const storeProduct = await db.query.storeProductsTable.findFirst({
      where: and(
        eq(storeProductsTable.id, storeProductId),
        eq(storeProductsTable.businessId, businessId)
      ),
    });

    if (!storeProduct) {
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    // Calculate new cached stock
    const cachedStock = await syncCachedStock(storeProduct.productId);

    // Update
    const [updated] = await db
      .update(storeProductsTable)
      .set({
        cachedStock,
        updatedAt: new Date(),
      })
      .where(eq(storeProductsTable.id, storeProductId))
      .returning();

    return { data: updated, error: null };
  } catch (error) {
    console.error("Failed to update cached stock:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
