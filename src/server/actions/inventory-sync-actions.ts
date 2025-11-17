"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  customerOrderItemsTable,
  productsTable,
  warehouseItemsTable,
} from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";
import type { ServiceResponse } from "@/server/types";

export const syncInventoryAfterOrder = async (
  orderId: string
): Promise<ServiceResponse<{ syncedItems: number }>> => {
  if (!orderId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const orderItems = await db
      .select()
      .from(customerOrderItemsTable)
      .where(eq(customerOrderItemsTable.customerOrderId, orderId));

    if (orderItems.length === 0) {
      return { data: { syncedItems: 0 }, error: null };
    }

    let syncedItems = 0;

    for (const item of orderItems) {
      const [warehouseItem] = await db
        .select()
        .from(warehouseItemsTable)
        .where(eq(warehouseItemsTable.id, item.warehouseItemId))
        .leftJoin(
          productsTable,
          eq(warehouseItemsTable.productId, productsTable.id)
        )
        .limit(1);

      if (!warehouseItem) {
        console.warn(`Product not found: ${item.warehouseItemId}`);
        continue;
      }

      const currentStock = warehouseItem.warehouse_items.quantity || 0;
      const newStock = Math.max(0, currentStock - item.quantity);

      await db
        .update(warehouseItemsTable)
        .set({
          quantity: newStock,
          lastUpdated: new Date(),
        })
        .where(eq(warehouseItemsTable.id, item.warehouseItemId));

      syncedItems++;

      // Check if stock is low and send notification
      if (newStock <= 5) {
        // TODO: Send low stock notification
        console.log(
          `Low stock alert: ${warehouseItem.products?.name} has ${newStock} units left`
        );
      }
    }

    return { data: { syncedItems }, error: null };
  } catch (error) {
    console.error("Failed to sync inventory after order:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
