"use server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogsTable, warehouseItemsTable } from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertWarehouseItem,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "../../constants/errors";

export async function create(
  businessId: string,
  userId: string,
  warehouseItem: InsertWarehouseItem,
) {
  try {
    const result = await db.transaction(async (tx) => {
      const [newWarehouseItem] = await tx
        .insert(warehouseItemsTable)
        .values(warehouseItem)
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "warehouseItem",
        recordId: newWarehouseItem.id,
        action: "create-warehouseItem",
        changes: JSON.stringify(warehouseItem),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return newWarehouseItem;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Error creating warehouseItem:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  businessId: string,
  warehouseItemId: string,
  userId: string,
  updates: Partial<InsertWarehouseItem>,
) {
  try {
    const result = await db.transaction(async (tx) => {
      const [updatedWarehouseItem] = await tx
        .update(warehouseItemsTable)
        .set({ ...updates })
        .where(eq(warehouseItemsTable.id, warehouseItemId))
        .returning();

      if (!updatedWarehouseItem) {
        return null;
      }

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "warehouseItem",
        recordId: updatedWarehouseItem.id,
        action: "update-warehouse-item",
        changes: JSON.stringify(updates),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return updatedWarehouseItem;
    });

    if (!result) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    let warehouseId = updates.warehouseId;
    if (!warehouseId) {
      const item = await db.query.warehouseItemsTable.findFirst({
        where: and(eq(warehouseItemsTable.id, warehouseItemId)),
      });
      warehouseId = item?.warehouseId;
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Error updating warehouseItem:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(
  warehouseItemId: string,
  businessId: string,
  userId: string,
) {
  try {
    const item = await db.query.warehouseItemsTable.findFirst({
      where: and(eq(warehouseItemsTable.id, warehouseItemId)),
    });

    const result = await db.transaction(async (tx) => {
      const [deletedWarehouseItem] = await tx
        .delete(warehouseItemsTable)
        .where(eq(warehouseItemsTable.id, warehouseItemId))
        .returning();

      if (!deletedWarehouseItem) {
        return null;
      }

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "warehouseItem",
        recordId: warehouseItemId,
        action: "delete-warehouseItem",
        changes: JSON.stringify(item),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return deletedWarehouseItem;
    });

    if (!result) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Error deleting warehouseItem:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create_many(warehouseItems: InsertWarehouseItem[]) {
  if (!warehouseItems.length)
    return { data: null, error: ErrorCode.MISSING_INPUT };

  const warehouseId = warehouseItems[0]?.warehouseId;
  if (
    !warehouseId ||
    !warehouseItems.every((w) => w.warehouseId === warehouseId)
  ) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .insert(warehouseItemsTable)
      .values(warehouseItems)
      .returning();

    return { data: result, error: null };
  } catch (error) {
    console.error("Error creating warehouseItems:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
