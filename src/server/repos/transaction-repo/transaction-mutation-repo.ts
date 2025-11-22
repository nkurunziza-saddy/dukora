"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  auditLogsTable,
  productSuppliersTable,
  transactionsTable,
  warehouseItemsTable,
} from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertProductSupplier,
  InsertTransaction,
  SelectWarehouseItem,
} from "@/lib/schema/schema-types";
import { calculateStockChange } from "@/server/business-logic/transactions";
import { ErrorCode } from "@/server/constants/errors";

import * as notificationRepo from "@/server/repos/notification-repo";
import { create as createWarehouseItem } from "@/server/repos/warehouse-item-repo";

type NotificationPayload = {
  type: "order" | "inventory";
  priority: "medium" | "low";
  title: string;
  message: string;
  data: any;
};

export async function create(
  transaction: InsertTransaction,
  notificationPayload?: NotificationPayload,
) {
  if (
    !transaction.productId ||
    !transaction.businessId ||
    !transaction.warehouseItemId ||
    !transaction.type ||
    !transaction.quantity
  ) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [newTransaction] = await tx
        .insert(transactionsTable)
        .values(transaction)
        .returning();

      const stockChange = calculateStockChange(
        transaction.type,
        transaction.quantity,
      );

      const [updatedWarehouseItem] = await tx
        .update(warehouseItemsTable)
        .set({
          quantity: sql`${warehouseItemsTable.quantity} + ${stockChange}`,
          lastUpdated: new Date(),
        })
        .where(eq(warehouseItemsTable.id, transaction.warehouseItemId))
        .returning();

      const auditData: InsertAuditLog = {
        businessId: transaction.businessId,
        model: "warehouseItem",
        recordId: updatedWarehouseItem.id,
        action: "update-warehouse-item",
        changes: JSON.stringify(updatedWarehouseItem),
        performedBy: transaction.createdBy,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      if (notificationPayload) {
        const { data, ...rest } = notificationPayload;
        await notificationRepo.create({
          businessId: transaction.businessId,
          ...rest,
          data: {
            ...data,
            transactionId: newTransaction.id,
          },
        });
      }

      return newTransaction;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create_with_warehouse_item(
  transaction: Omit<InsertTransaction, "warehouseItemId">,
  notificationPayload?: NotificationPayload,
) {
  if (
    !transaction.productId ||
    !transaction.businessId ||
    !transaction.type ||
    !transaction.quantity
  ) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const warehouseItemData = {
        productId: transaction.productId,
        warehouseId: transaction.warehouseId,
        quantity: transaction.quantity,
        lastUpdated: new Date(),
      };
      const existingWarehouseItem =
        await tx.query.warehouseItemsTable.findFirst({
          where: and(
            eq(warehouseItemsTable.productId, transaction.productId),
            eq(warehouseItemsTable.warehouseId, transaction.warehouseId),
          ),
        });
      let warehouseItem: SelectWarehouseItem | undefined;
      if (existingWarehouseItem) {
        const updatedWarehouseItem = await tx
          .update(warehouseItemsTable)
          .set({
            quantity: sql`${warehouseItemsTable.quantity} + ${transaction.quantity}`,
            lastUpdated: new Date(),
          })
          .where(eq(warehouseItemsTable.id, existingWarehouseItem.id))
          .returning();
        warehouseItem = updatedWarehouseItem[0];
      } else {
        const newWarehouseItem = await createWarehouseItem(
          transaction.businessId,
          transaction.createdBy,
          warehouseItemData,
        );
        if (newWarehouseItem.error) {
          return { data: null, error: newWarehouseItem.error };
        }
        warehouseItem = newWarehouseItem.data;
      }

      const [newTransaction] = await tx
        .insert(transactionsTable)
        .values({
          ...transaction,
          warehouseItemId: warehouseItem.id ?? "",
        })
        .returning();
      const productSupplierData: InsertProductSupplier = {
        productId: transaction.productId,
        supplierId: transaction.supplierId ?? "",
        businessId: transaction.businessId,
        note: transaction.note,
        supplierProductCode: warehouseItem.id ?? "",
      };
      await tx.insert(productSuppliersTable).values(productSupplierData);

      if (notificationPayload) {
        const { data, ...rest } = notificationPayload;
        await notificationRepo.create({
          businessId: transaction.businessId,
          ...rest,
          data: {
            ...data,
            transactionId: newTransaction.id,
          },
        });
      }

      return { data: newTransaction, error: null };
    });

    return result;
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
