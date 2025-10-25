"use server";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogsTable, suppliersTable } from "@/lib/schema";
import type { InsertAuditLog, InsertSupplier } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function create(
  businessId: string,
  userId: string,
  supplier: InsertSupplier,
) {
  if (!supplier.name || !supplier.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [newSupplier] = await tx
        .insert(suppliersTable)
        .values(supplier)
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "supplier",
        recordId: newSupplier.id,
        action: "create-supplier",
        changes: JSON.stringify(supplier),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return newSupplier;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  supplierId: string,
  businessId: string,
  userId: string,
  updates: Partial<InsertSupplier>,
) {
  if (!supplierId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [updatedSupplier] = await tx
        .update(suppliersTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(
            eq(suppliersTable.id, supplierId),
            eq(suppliersTable.businessId, businessId),
            isNull(suppliersTable.deletedAt),
          ),
        )
        .returning();

      if (updatedSupplier === undefined) {
        return { data: null, error: ErrorCode.SUPPLIER_NOT_FOUND };
      }

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "supplier",
        recordId: updatedSupplier.id,
        action: "update-supplier",
        changes: JSON.stringify(updates),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return { data: updatedSupplier, error: null };
    });

    return result;
  } catch (error) {
    console.error("Failed to update supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(
  supplierId: string,
  businessId: string,
  userId: string,
) {
  if (!supplierId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const existingRecord = await db.query.suppliersTable.findFirst({
      where: eq(suppliersTable.id, supplierId),
    });
    if (!existingRecord) {
      return { data: null, error: ErrorCode.SUPPLIER_NOT_FOUND };
    }
    const result = await db.transaction(async (tx) => {
      const [updatedSupplier] = await tx
        .update(suppliersTable)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(suppliersTable.id, supplierId),
            eq(suppliersTable.businessId, businessId),
          ),
        )
        .returning();

      if (updatedSupplier === undefined) {
        return { data: null, error: ErrorCode.SUPPLIER_NOT_FOUND };
      }

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "supplier",
        recordId: supplierId,
        action: "delete-supplier",
        changes: JSON.stringify(existingRecord),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return { data: updatedSupplier, error: null };
    });

    return result;
  } catch (error) {
    console.error("Failed to delete supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create_many(suppliers: InsertSupplier[]) {
  if (!suppliers.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  const businessId = suppliers[0]?.businessId;
  if (!businessId || !suppliers.every((p) => p.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .insert(suppliersTable)
      .values(suppliers)
      .returning();

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create suppliers:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
