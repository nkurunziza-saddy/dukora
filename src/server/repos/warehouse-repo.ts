"use server";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import { auditLogsTable, warehousesTable } from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertWarehouse,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "../constants/errors";

export const get_all = cache(async (businessId: string) => {
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
});

export const get_all_cached = unstable_cache(
  async (businessId: string) => {
    return get_all(businessId);
  },
  ["warehouses"],
  {
    tags: ["warehouses"],
    revalidate: 300,
  },
);

export const get_by_id = cache(
  async (warehouseId: string, businessId: string) => {
    if (!warehouseId || !businessId) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    try {
      const warehouse = await db.query.warehousesTable.findFirst({
        where: and(
          eq(warehousesTable.id, warehouseId),
          eq(warehousesTable.businessId, businessId),
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
  },
);

export const get_by_id_cached = unstable_cache(
  async (warehouseId: string, businessId: string) => {
    return get_by_id(warehouseId, businessId);
  },
  ["warehouses"],
  {
    tags: [`warehouses`],
    revalidate: 300,
  },
);

export async function create(warehouse: InsertWarehouse, userId: string) {
  if (!warehouse.name || !warehouse.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db.transaction(async (tx) => {
      const existingWarehouse = await db.query.warehousesTable.findFirst({
        where: and(
          eq(warehousesTable.businessId, warehouse.businessId),
          eq(warehousesTable.name, warehouse.name),
        ),
      });
      if (existingWarehouse) {
        return { data: null, error: ErrorCode.ALREADY_EXISTS };
      }
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
      return { data: newWarehouse, error: null };
    });

    revalidatePath("/", "layout");

    return result;
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  warehouseId: string,
  businessId: string,
  userId: string,
  updates: Partial<InsertWarehouse>,
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
            eq(warehousesTable.businessId, businessId),
          ),
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

    revalidatePath("/", "layout");

    return { data: result, error: null };
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(
  warehouseId: string,
  businessId: string,
  userId: string,
) {
  if (!warehouseId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const existingRecord = await db.query.warehousesTable.findFirst({
      where: eq(warehousesTable.id, warehouseId),
      with: {
        warehouseItems: true,
      },
    });
    if (!existingRecord) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }
    if (existingRecord.warehouseItems.length > 0) {
      return { data: null, error: ErrorCode.CANNOT_DELETE };
    }
    const result = await db.transaction(async (tx) => {
      const [deletedWarehouse] = await tx
        .delete(warehousesTable)
        .where(
          and(
            eq(warehousesTable.id, warehouseId),
            eq(warehousesTable.businessId, businessId),
          ),
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

    revalidatePath("/", "layout");

    return { data: result, error: null };
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create_many(
  warehouses: InsertWarehouse[],
  userId: string,
) {
  if (warehouses === null || warehouses.length === 0) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const businessId = warehouses[0]?.businessId;
  if (!businessId || !warehouses.every((w) => w.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db.transaction(async (tx) => {
      const createdWarehouses = [];
      for (const warehouse of warehouses) {
        const existingWarehouse = await db.query.warehousesTable.findFirst({
          where: and(
            eq(warehousesTable.businessId, warehouse.businessId),
            eq(warehousesTable.name, warehouse.name),
          ),
        });
        if (existingWarehouse) continue;
        const [newWarehouse] = await tx
          .insert(warehousesTable)
          .values(warehouse)
          .returning();

        const auditLog: InsertAuditLog = {
          businessId: newWarehouse.businessId,
          model: "warehouse",
          recordId: newWarehouse.id,
          action: "create-warehouse",
          changes: JSON.stringify(newWarehouse),
          performedBy: userId,
          performedAt: new Date(),
        };
        await tx.insert(auditLogsTable).values(auditLog);
        createdWarehouses.push(newWarehouse);
      }
      return createdWarehouses;
    });

    revalidatePath("/", "layout");

    return { data: result, error: null };
  } catch (error) {
    console.error("Error creating warehouses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
