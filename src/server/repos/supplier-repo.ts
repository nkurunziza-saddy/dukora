"use server";

import { eq, desc, and, isNull } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { auditLogsTable, suppliersTable } from "@/lib/schema";
import type { InsertAuditLog, InsertSupplier } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { cache } from "react";

export const get_all = cache(async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const suppliers = await db
      .select()
      .from(suppliersTable)
      .where(
        and(
          eq(suppliersTable.businessId, businessId),
          isNull(suppliersTable.deletedAt)
        )
      )
      .orderBy(desc(suppliersTable.createdAt));
    return { data: suppliers, error: null };
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
});

export const get_all_cached = unstable_cache(
  async (businessId: string) => {
    return get_all(businessId);
  },
  ["suppliers"],
  {
    revalidate: 300,
    tags: ["suppliers"],
  }
);

export async function get_by_id(supplierId: string, businessId: string) {
  if (!supplierId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const supplier = await db.query.suppliersTable.findFirst({
      where: and(
        eq(suppliersTable.id, supplierId),
        eq(suppliersTable.businessId, businessId)
      ),
      with: {
        productSuppliers: true,
      },
    });

    if (!supplier) {
      return {
        data: null,
        error: ErrorCode.SUPPLIER_NOT_FOUND,
      };
    }

    return { data: supplier, error: null };
  } catch (error) {
    console.error("Failed to fetch supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const get_by_id_cached = unstable_cache(
  async (supplierId: string, businessId: string) => {
    return get_by_id(supplierId, businessId);
  },
  ["suppliers", "by-id"],
  {
    revalidate: 300,
    tags: ["suppliers", "supplier-by-id"],
  }
);

export async function create(
  businessId: string,
  userId: string,
  supplier: InsertSupplier
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
    revalidatePath("/", "layout");

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
  updates: Partial<InsertSupplier>
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
            isNull(suppliersTable.deletedAt)
          )
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

    revalidatePath("/", "layout");

    return result;
  } catch (error) {
    console.error("Failed to update supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(
  supplierId: string,
  businessId: string,
  userId: string
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
            eq(suppliersTable.businessId, businessId)
          )
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

    revalidatePath("/", "layout");

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

    revalidatePath("/", "layout");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create suppliers:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
