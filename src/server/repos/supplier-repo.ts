"use server";

import { eq, desc, and, isNull } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { auditLogsTable, suppliersTable } from "@/lib/schema";
import type { InsertAuditLog, InsertSupplier } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function getAll(businessId: string) {
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
}

export const getAllCached = async (businessId: string) =>
  unstable_cache(
    async () => await getAll(businessId),
    ["suppliers", businessId],
    {
      revalidate: 300,
      tags: [`suppliers-${businessId}`],
    }
  );

export async function getById(supplierId: string, businessId: string) {
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
        error: ErrorCode.SUPPLIER_NOT_FOUND ?? ErrorCode.PRODUCT_NOT_FOUND,
      };
    }

    return { data: supplier, error: null };
  } catch (error) {
    console.error("Failed to fetch supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const getByIdCached = async (supplierId: string, businessId: string) =>
  unstable_cache(
    async () => await getById(supplierId, businessId),
    ["suppliers", supplierId, businessId],
    {
      revalidate: 300,
      tags: [`suppliers-${businessId}`, `supplier-${supplierId}`],
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

    revalidateTag("suppliers");
    revalidateTag(`suppliers-${supplier.businessId}`);

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
      return updatedSupplier;
    });

    if (!result) {
      return {
        data: null,
        error: ErrorCode.SUPPLIER_NOT_FOUND ?? ErrorCode.PRODUCT_NOT_FOUND,
      };
    }

    revalidateTag(`suppliers-${businessId}`);
    revalidateTag(`supplier-${supplierId}`);

    return { data: result, error: null };
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
      return updatedSupplier;
    });

    if (!result) {
      return {
        data: null,
        error: ErrorCode.SUPPLIER_NOT_FOUND ?? ErrorCode.PRODUCT_NOT_FOUND,
      };
    }

    revalidateTag(`suppliers-${businessId}`);
    revalidateTag(`supplier-${supplierId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to delete supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createMany(suppliers: InsertSupplier[]) {
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

    revalidateTag(`suppliers-${businessId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create suppliers:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
