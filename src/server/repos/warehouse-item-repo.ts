"use server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { revalidateTag, unstable_cache } from "next/cache";
import { warehouseItemsTable } from "@/lib/schema";
import type { InsertWarehouseItem } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "../actions/auth/permission-middleware";
import { Permission } from "../constants/permissions";
import { ErrorCode } from "../constants/errors";

export async function getAll(warehouseId: string) {
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };
  if (!warehouseId) return { data: null, error: ErrorCode.MISSING_INPUT };
  try {
    const items = await db
      .select()
      .from(warehouseItemsTable)
      .where(eq(warehouseItemsTable.warehouseId, warehouseId));
    return { data: items, error: null };
  } catch (error) {
    console.error("Error getting warehouseItems:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const getAllCached = async (warehouseId: string) =>
  unstable_cache(
    async () => await getAll(warehouseId),
    ["warehouseItems", warehouseId],
    {
      revalidate: 300,
      tags: [`warehouseItems-${warehouseId}`],
    }
  );

export async function getById(warehouseItemId: string) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_VIEW
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };
  if (!warehouseItemId) return { data: null, error: ErrorCode.MISSING_INPUT };
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

export const getByIdCached = async (warehouseItemId: string) =>
  unstable_cache(
    async () => await getById(warehouseItemId),
    ["warehouseItems", warehouseItemId],
    {
      revalidate: 300,
      tags: [`warehouseItem-${warehouseItemId}`],
    }
  );

export async function create(warehouseItem: InsertWarehouseItem) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_VIEW
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };
  if (!warehouseItem.warehouseId)
    return { data: null, error: ErrorCode.MISSING_INPUT };
  try {
    const [newWarehouseItem] = await db
      .insert(warehouseItemsTable)
      .values(warehouseItem)
      .returning();

    revalidateTag(`warehouseItems-${warehouseItem.warehouseId}`);
    return { data: newWarehouseItem, error: null };
  } catch (error) {
    console.error("Error creating warehouseItem:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  warehouseItemId: string,
  updates: Partial<InsertWarehouseItem>
) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_UPDATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };
  if (!warehouseItemId) return { data: null, error: ErrorCode.MISSING_INPUT };
  try {
    const [updatedWarehouseItem] = await db
      .update(warehouseItemsTable)
      .set({ ...updates })
      .where(eq(warehouseItemsTable.id, warehouseItemId))
      .returning();

    if (!updatedWarehouseItem) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    let warehouseId = updates.warehouseId;
    if (!warehouseId) {
      const item = await db.query.warehouseItemsTable.findFirst({
        where: and(eq(warehouseItemsTable.id, warehouseItemId)),
      });
      warehouseId = item?.warehouseId;
    }
    if (warehouseId) revalidateTag(`warehouseItems-${warehouseId}`);

    return { data: updatedWarehouseItem, error: null };
  } catch (error) {
    console.error("Error updating warehouseItem:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(warehouseItemId: string) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_DELETE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };
  if (!warehouseItemId) return { data: null, error: ErrorCode.MISSING_INPUT };
  try {
    const item = await db.query.warehouseItemsTable.findFirst({
      where: and(eq(warehouseItemsTable.id, warehouseItemId)),
    });
    const warehouseId = item?.warehouseId;

    const deletedRows = await db
      .delete(warehouseItemsTable)
      .where(eq(warehouseItemsTable.id, warehouseItemId))
      .returning();

    if (deletedRows.length === 0) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    if (warehouseId) revalidateTag(`warehouseItems-${warehouseId}`);
    return { data: deletedRows[0], error: null };
  } catch (error) {
    console.error("Error deleting warehouseItem:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createMany(warehouseItems: InsertWarehouseItem[]) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_VIEW
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };
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

    revalidateTag(`warehouseItems-${warehouseId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Error creating warehouseItems:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
