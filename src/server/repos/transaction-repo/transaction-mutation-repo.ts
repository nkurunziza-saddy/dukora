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
import { ErrorCode } from "@/server/constants/errors";
import { create as createWarehouseItem } from "@/server/repos/warehouse-item-repo";

export async function create(transaction: InsertTransaction) {
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

      const stockChange =
        transaction.type === "SALE" || transaction.type === "DAMAGE"
          ? -Math.abs(transaction.quantity)
          : Math.abs(transaction.quantity);

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

      return newTransaction;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
