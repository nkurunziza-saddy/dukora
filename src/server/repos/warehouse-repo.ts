"use server";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { revalidateTag, unstable_cache } from "next/cache";
import { warehousesTable } from "@/lib/schema";
import type { InsertWarehouse } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "../actions/auth/permission-middleware";
import { Permission } from "../constants/permissions";
import { ErrorCode } from "../constants/errors";

export async function getAll(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_VIEW);
  if (!currentUser || currentUser.businessId !== businessId) {
    return { data: null, error: ErrorCode.UNAUTHORIZED };
  }
  try {
    const warehouses = await db
      .select()
      .from(warehousesTable)
      .where(eq(warehousesTable.businessId, businessId))
      .orderBy(desc(warehousesTable.createdAt));
    return { data: warehouses, error: null };
  } catch (error) {
    console.error("Error getting warehouses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const getAllCached = async (businessId: string) =>
  unstable_cache(
    async () => await getAll(businessId),
    ["warehouses", businessId],
    {
      revalidate: 300,
      tags: [`warehouses-${businessId}`],
    }
  );

export async function getById(warehouseId: string, businessId: string) {
  if (!warehouseId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_VIEW);
  if (!currentUser || currentUser.businessId !== businessId) {
    return { data: null, error: ErrorCode.UNAUTHORIZED };
  }
  try {
    const warehouse = await db.query.warehousesTable.findFirst({
      where: and(
        eq(warehousesTable.id, warehouseId),
        eq(warehousesTable.businessId, businessId)
      ),
      with: {
        transactions: true,
        warehouseItems: true,
      },
    });

    if (!warehouse) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: warehouse, error: null };
  } catch (error) {
    console.error("Error getting warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const getByIdCached = async (warehouseId: string, businessId: string) =>
  unstable_cache(
    async () => await getById(warehouseId, businessId),
    ["warehouses", warehouseId, businessId],
    {
      revalidate: 300,
      tags: [`warehouses-${businessId}`, `warehouse-${warehouseId}`],
    }
  );

export async function create(warehouse: InsertWarehouse) {
  if (!warehouse.name || !warehouse.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_CREATE);
  if (!currentUser || currentUser.businessId !== warehouse.businessId) {
    return { data: null, error: ErrorCode.UNAUTHORIZED };
  }
  try {
    const [newWarehouse] = await db
      .insert(warehousesTable)
      .values(warehouse)
      .returning();

    revalidateTag(`warehouses-${warehouse.businessId}`);

    return { data: newWarehouse, error: null };
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  warehouseId: string,
  businessId: string,
  updates: Partial<InsertWarehouse>
) {
  if (!warehouseId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_UPDATE);
  if (!currentUser || currentUser.businessId !== businessId) {
    return { data: null, error: ErrorCode.UNAUTHORIZED };
  }
  try {
    const [updatedWarehouse] = await db
      .update(warehousesTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(warehousesTable.id, warehouseId),
          eq(warehousesTable.businessId, businessId)
        )
      )
      .returning();

    if (!updatedWarehouse) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    revalidateTag(`warehouses-${businessId}`);
    revalidateTag(`warehouse-${warehouseId}`);

    return { data: updatedWarehouse, error: null };
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(warehouseId: string, businessId: string) {
  if (!warehouseId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_DELETE);
  if (!currentUser || currentUser.businessId !== businessId) {
    return { data: null, error: ErrorCode.UNAUTHORIZED };
  }
  try {
    const deletedRows = await db
      .delete(warehousesTable)
      .where(
        and(
          eq(warehousesTable.id, warehouseId),
          eq(warehousesTable.businessId, businessId)
        )
      )
      .returning();

    if (deletedRows.length === 0) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    revalidateTag(`warehouses-${businessId}`);
    revalidateTag(`warehouse-${warehouseId}`);

    return { data: deletedRows[0], error: null };
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createMany(warehouses: InsertWarehouse[]) {
  if (!warehouses.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const businessId = warehouses[0]?.businessId;
  if (!businessId || !warehouses.every((w) => w.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_CREATE);
  if (!currentUser || currentUser.businessId !== businessId) {
    return { data: null, error: ErrorCode.UNAUTHORIZED };
  }
  try {
    const result = await db
      .insert(warehousesTable)
      .values(warehouses)
      .returning();

    revalidateTag(`warehouses-${businessId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Error creating warehouses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
