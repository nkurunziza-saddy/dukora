"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import {
  auditLogsTable,
  productsTable,
  warehouseItemsTable,
  warehousesTable,
} from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertWarehouseItem,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "../constants/errors";

export const get_all = cache(async (warehouseId: string) => {
  try {
    const items = await db
      .select()
      .from(warehouseItemsTable)
      .where(eq(warehouseItemsTable.warehouseId, warehouseId));
    return { data: items, error: null };
  } catch (error) {
    console.error("Error getting warehouse items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
});

export const get_all_cached = unstable_cache(
  async (warehouseId: string) => {
    return await get_all(warehouseId);
  },
  ["warehouses", "warehouse-items"],
  {
    tags: ["warehouses", "warehouse-items"],
    revalidate: 300,
  },
);

export async function get_all_by_business_id(businessId: string) {
  try {
    const items = await db
      .select({
        warehouseItem: warehouseItemsTable,
        product: productsTable,
      })
      .from(warehousesTable)
      .innerJoin(
        warehouseItemsTable,
        eq(warehousesTable.id, warehouseItemsTable.warehouseId),
      )
      .innerJoin(
        productsTable,
        eq(warehouseItemsTable.productId, productsTable.id),
      )
      .where(eq(warehousesTable.businessId, businessId));
    return { data: items, error: null };
  } catch (error) {
    console.error("Error getting warehouse items:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_by_id(warehouseItemId: string) {
  try {
    const warehouseItem = await db.query.warehouseItemsTable.findFirst({
      where: and(eq(warehouseItemsTable.id, warehouseItemId)),
      with: {
        warehouse: true,
      },
    });

    if (!warehouseItem) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: warehouseItem, error: null };
  } catch (error) {
    console.error("Error getting warehouseItem:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const get_by_id_cached = unstable_cache(
  async (warehouseItemId: string) => {
    return get_by_id(warehouseItemId);
  },
  ["warehouses", "warehouse-item"],
  {
    tags: [`warehouses`, "warehouse-item"],
    revalidate: 300,
  },
);

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

    revalidatePath("/", "layout");
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
    if (warehouseId) revalidatePath("/", "layout");

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

    revalidatePath("/", "layout");
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

    revalidatePath("/", "layout");

    return { data: result, error: null };
  } catch (error) {
    console.error("Error creating warehouseItems:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
