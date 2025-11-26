"use server";

import { and, eq, gte, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  auditLogsTable,
  productsTable,
  storeProductsTable,
  transactionsTable,
  warehouseItemsTable,
} from "@/lib/schema";
import type {
  InsertAuditLog,
  SelectWarehouseItem,
} from "@/lib/schema/schema-types";
import { ERROR_CODE } from "@/server/constants/errors";

/**
 * Sync cached stock for a store product from warehouse items
 */
export async function sync_cached_stock(
  storeProductId: string,
  businessId: string
) {
  if (!storeProductId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    // Get actual stock from warehouses
    const [stockData] = await db
      .select({
        productId: storeProductsTable.productId,
        actualStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
      })
      .from(storeProductsTable)
      .innerJoin(
        productsTable,
        eq(storeProductsTable.productId, productsTable.id)
      )
      .leftJoin(
        warehouseItemsTable,
        eq(productsTable.id, warehouseItemsTable.productId)
      )
      .where(
        and(
          eq(storeProductsTable.id, storeProductId),
          eq(storeProductsTable.businessId, businessId)
        )
      )
      .groupBy(storeProductsTable.productId);

    if (!stockData) {
      return { data: null, error: ERROR_CODE.PRODUCT_NOT_FOUND };
    }

    // Update cached stock
    const [updated] = await db
      .update(storeProductsTable)
      .set({
        cachedStock: Number(stockData.actualStock),
        updatedAt: new Date(),
      })
      .where(eq(storeProductsTable.id, storeProductId))
      .returning();

    return { data: updated, error: null };
  } catch (error) {
    console.error("Failed to sync cached stock:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function bulk_sync_inventory(businessId: string, userId: string) {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const products = await tx
        .select({
          storeProductId: storeProductsTable.id,
          productId: storeProductsTable.productId,
          actualStock: sql<number>`COALESCE(SUM(${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}), 0)`,
        })
        .from(storeProductsTable)
        .innerJoin(
          productsTable,
          eq(storeProductsTable.productId, productsTable.id)
        )
        .leftJoin(
          warehouseItemsTable,
          eq(productsTable.id, warehouseItemsTable.productId)
        )
        .where(
          and(
            eq(storeProductsTable.businessId, businessId),
            eq(storeProductsTable.isPublished, true),
            isNull(storeProductsTable.deletedAt)
          )
        )
        .groupBy(storeProductsTable.id, storeProductsTable.productId);

      const updates = await Promise.all(
        products.map((p) =>
          tx
            .update(storeProductsTable)
            .set({
              cachedStock: Number(p.actualStock),
              updatedAt: new Date(),
            })
            .where(eq(storeProductsTable.id, p.storeProductId))
            .returning()
        )
      );

      const auditData: InsertAuditLog = {
        businessId,
        model: "store_product",
        recordId: "bulk",
        action: "bulk-sync-inventory",
        changes: JSON.stringify({ count: products.length }),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return { synced: products.length, updates: updates.flat() };
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to bulk sync inventory:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export async function reserve_inventory(
  items: {
    storeProductId: string;
    quantity: number;
    warehouseId?: string;
  }[],
  businessId: string,
  userId: string,
  referenceId: string
) {
  if (!items.length || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const reservations = [];

      for (const item of items) {
        const storeProduct = await tx.query.storeProductsTable.findFirst({
          where: and(
            eq(storeProductsTable.id, item.storeProductId),
            eq(storeProductsTable.businessId, businessId)
          ),
        });

        if (!storeProduct) continue;

        // Find warehouse with available stock
        let warehouseItem: SelectWarehouseItem | undefined;
        if (item.warehouseId) {
          // Use specified warehouse
          warehouseItem = await tx.query.warehouseItemsTable.findFirst({
            where: and(
              eq(warehouseItemsTable.productId, storeProduct.productId),
              eq(warehouseItemsTable.warehouseId, item.warehouseId),
              gte(
                sql`${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}`,
                item.quantity
              )
            ),
          });
        } else {
          // Auto-select warehouse with enough stock
          const availableWarehouses = await tx
            .select()
            .from(warehouseItemsTable)
            .where(
              and(
                eq(warehouseItemsTable.productId, storeProduct.productId),
                gte(
                  sql`${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty}`,
                  item.quantity
                )
              )
            )
            .orderBy(
              sql`${warehouseItemsTable.quantity} - ${warehouseItemsTable.reservedQty} DESC`
            )
            .limit(1);

          warehouseItem = availableWarehouses[0];
        }

        if (!warehouseItem) {
          throw new Error(
            `Insufficient inventory for product ${item.storeProductId}`
          );
        }

        // Reserve the inventory
        const [reserved] = await tx
          .update(warehouseItemsTable)
          .set({
            reservedQty: sql`${warehouseItemsTable.reservedQty} + ${item.quantity}`,
            lastUpdated: new Date(),
          })
          .where(eq(warehouseItemsTable.id, warehouseItem.id))
          .returning();

        // Create INVENTORY_RESERVE transaction
        await tx.insert(transactionsTable).values({
          productId: storeProduct.productId,
          warehouseId: warehouseItem.warehouseId,
          warehouseItemId: warehouseItem.id,
          businessId,
          type: "INVENTORY_RESERVE",
          quantity: item.quantity,
          reference: referenceId,
          source: "STORE",
          note: `Reserved for checkout`,
          createdBy: userId,
        });

        reservations.push({
          storeProductId: item.storeProductId,
          warehouseItemId: warehouseItem.id,
          quantity: item.quantity,
        });
      }

      return reservations;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to reserve inventory:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : ERROR_CODE.FAILED_REQUEST,
    };
  }
}

/**
 * Release reserved inventory (cart abandonment / checkout cancelled)
 */
export async function release_inventory(
  reservations: {
    warehouseItemId: string;
    quantity: number;
  }[],
  businessId: string,
  userId: string,
  referenceId: string
) {
  if (!reservations.length || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      for (const reservation of reservations) {
        const warehouseItem = await tx.query.warehouseItemsTable.findFirst({
          where: eq(warehouseItemsTable.id, reservation.warehouseItemId),
          with: {
            product: true,
            warehouse: true,
          },
        });

        if (!warehouseItem) continue;

        // Release the reservation
        await tx
          .update(warehouseItemsTable)
          .set({
            reservedQty: sql`GREATEST(0, ${warehouseItemsTable.reservedQty} - ${reservation.quantity})`,
            lastUpdated: new Date(),
          })
          .where(eq(warehouseItemsTable.id, reservation.warehouseItemId));

        // Create INVENTORY_RELEASE transaction
        await tx.insert(transactionsTable).values({
          productId: warehouseItem.productId,
          warehouseId: warehouseItem.warehouseId,
          warehouseItemId: warehouseItem.id,
          businessId,
          type: "INVENTORY_RELEASE",
          quantity: reservation.quantity,
          reference: referenceId,
          source: "STORE",
          note: `Released reservation`,
          createdBy: userId,
        });
      }

      return { released: reservations.length };
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to release inventory:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}

/**
 * Allocate inventory to order (convert reservation to sale)
 */
export async function allocate_inventory_to_order(
  orderId: string,
  items: {
    storeProductId: string;
    warehouseItemId: string;
    quantity: number;
  }[],
  businessId: string,
  userId: string
) {
  if (!items.length || !businessId || !orderId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const allocations = [];

      for (const item of items) {
        const warehouseItem = await tx.query.warehouseItemsTable.findFirst({
          where: eq(warehouseItemsTable.id, item.warehouseItemId),
        });

        if (!warehouseItem) continue;

        const storeProduct = await tx.query.storeProductsTable.findFirst({
          where: eq(storeProductsTable.id, item.storeProductId),
        });

        if (!storeProduct) continue;

        // Deduct from quantity and reserved
        await tx
          .update(warehouseItemsTable)
          .set({
            quantity: sql`${warehouseItemsTable.quantity} - ${item.quantity}`,
            reservedQty: sql`GREATEST(0, ${warehouseItemsTable.reservedQty} - ${item.quantity})`,
            lastUpdated: new Date(),
          })
          .where(eq(warehouseItemsTable.id, item.warehouseItemId));

        // Create ONLINE_SALE transaction
        await tx.insert(transactionsTable).values({
          productId: storeProduct.productId,
          warehouseId: warehouseItem.warehouseId,
          warehouseItemId: warehouseItem.id,
          businessId,
          type: "ONLINE_SALE",
          quantity: -item.quantity, // Negative for sale
          reference: orderId,
          customerOrderId: orderId,
          source: "STORE",
          note: `Online store sale`,
          createdBy: userId,
        });

        allocations.push({
          storeProductId: item.storeProductId,
          warehouseItemId: item.warehouseItemId,
          quantity: item.quantity,
        });
      }

      return allocations;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to allocate inventory:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
