"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customerOrderItemsTable, productsTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";
import type { ServiceResponse } from "@/server/types";

export const syncInventoryAfterOrder = async (
  orderId: string
): Promise<ServiceResponse<{ syncedItems: number }>> => {
  if (!orderId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    // Get order items
    const orderItems = await db
      .select()
      .from(customerOrderItemsTable)
      .where(eq(customerOrderItemsTable.customerOrderId, orderId));

    if (orderItems.length === 0) {
      return { data: { syncedItems: 0 }, error: null };
    }

    let syncedItems = 0;

    // Update inventory for each item
    for (const item of orderItems) {
      // Get current product stock
      const product = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, item.productId))
        .limit(1);

      if (!product[0]) {
        console.warn(`Product not found: ${item.productId}`);
        continue;
      }

      const currentStock = product[0].stockQuantity || 0;
      const newStock = Math.max(0, currentStock - item.quantity);

      // Update product stock
      await db
        .update(productsTable)
        .set({
          stockQuantity: newStock,
          updatedAt: new Date(),
        })
        .where(eq(productsTable.id, item.productId));

      syncedItems++;

      // Check if stock is low and send notification
      if (newStock <= 5) {
        // TODO: Send low stock notification
        console.log(
          `Low stock alert: ${product[0].name} has ${newStock} units left`
        );
      }
    }

    return { data: { syncedItems }, error: null };
  } catch (error) {
    console.error("Failed to sync inventory after order:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
