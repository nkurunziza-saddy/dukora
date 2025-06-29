"use server";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { revalidateTag, unstable_cache } from "next/cache";
import { warehousesTable, auditLogsTable } from "@/lib/schema";
import type { InsertWarehouse } from "@/lib/schema/schema-types";
import type { InsertAuditLog } from "@/lib/schema/schema-types";
import { ErrorCode } from "../constants/errors";

export async function getAll(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
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

export async function create(warehouse: InsertWarehouse, userId: string) {
  if (!warehouse.name || !warehouse.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db.transaction(async (tx) => {
      const [newWarehouse] = await tx
        .insert(warehousesTable)
        .values(warehouse)
        .returning();

      const auditData: InsertAuditLog = {
        businessId: warehouse.businessId,
        model: "warehouse",
        recordId: newWarehouse.id,
        action: "create-warehouse",
        changes: JSON.stringify(warehouse),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return newWarehouse;
    });

    revalidateTag(`warehouses-${warehouse.businessId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  warehouseId: string,
  businessId: string,
  userId: string,
  updates: Partial<InsertWarehouse>
) {
  if (!warehouseId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db.transaction(async (tx) => {
      const [updatedWarehouse] = await tx
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
        return null;
      }

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "warehouse",
        recordId: updatedWarehouse.id,
        action: "update-warehouse",
        changes: JSON.stringify(updates),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return updatedWarehouse;
    });

    if (!result) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    revalidateTag(`warehouses-${businessId}`);
    revalidateTag(`warehouse-${warehouseId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(
  warehouseId: string,
  businessId: string,
  userId: string
) {
  if (!warehouseId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const existingRecord = await db.query.warehousesTable.findFirst({
      where: eq(warehousesTable.id, warehouseId),
    });
    if (!existingRecord) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }
    const result = await db.transaction(async (tx) => {
      const [deletedWarehouse] = await tx
        .delete(warehousesTable)
        .where(
          and(
            eq(warehousesTable.id, warehouseId),
            eq(warehousesTable.businessId, businessId)
          )
        )
        .returning();

      if (!deletedWarehouse) {
        return null;
      }

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "warehouse",
        recordId: warehouseId,
        action: "delete-warehouse",
        changes: JSON.stringify(existingRecord),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return deletedWarehouse;
    });

    if (!result) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    revalidateTag(`warehouses-${businessId}`);
    revalidateTag(`warehouse-${warehouseId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createMany(
  warehouses: InsertWarehouse[],
  userId: string
) {
  if (warehouses === null) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const businessId = warehouses[0]?.businessId;
  if (!businessId || !warehouses.every((w) => w.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(warehousesTable)
        .values(warehouses)
        .returning();

      const auditLogs: InsertAuditLog[] = inserted.map((warehouse, idx) => ({
        businessId: businessId,
        model: "warehouse",
        recordId: warehouse.id,
        action: "create-warehouse",
        changes: JSON.stringify(warehouses[idx]),
        performedBy: userId,
        performedAt: new Date(),
      }));

      if (auditLogs.length) {
        await tx.insert(auditLogsTable).values(auditLogs);
      }

      return inserted;
    });

    revalidateTag(`warehouses-${businessId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Error creating warehouses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
