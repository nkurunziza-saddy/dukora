"use server";

import { eq, desc, and } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { suppliersTable } from "@/lib/schema";
import type { InsertSupplier } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function getAll(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const suppliers = await db
      .select()
      .from(suppliersTable)
      .where(eq(suppliersTable.businessId, businessId))
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

export async function create(supplier: InsertSupplier) {
  if (!supplier.name || !supplier.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.insert(suppliersTable).values(supplier).returning();

    revalidateTag("suppliers");
    revalidateTag(`suppliers-${supplier.businessId}`);

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to create supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  supplierId: string,
  businessId: string,
  updates: Partial<InsertSupplier>
) {
  if (!supplierId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .update(suppliersTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(suppliersTable.id, supplierId),
          eq(suppliersTable.businessId, businessId)
        )
      )
      .returning();

    if (result.length === 0) {
      return {
        data: null,
        error: ErrorCode.SUPPLIER_NOT_FOUND ?? ErrorCode.PRODUCT_NOT_FOUND,
      };
    }

    revalidateTag(`suppliers-${businessId}`);
    revalidateTag(`supplier-${supplierId}`);

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to update supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(supplierId: string, businessId: string) {
  if (!supplierId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .delete(suppliersTable)
      .where(
        and(
          eq(suppliersTable.id, supplierId),
          eq(suppliersTable.businessId, businessId)
        )
      )
      .returning();

    if (result.length === 0) {
      return {
        data: null,
        error: ErrorCode.SUPPLIER_NOT_FOUND ?? ErrorCode.PRODUCT_NOT_FOUND,
      };
    }

    revalidateTag(`suppliers-${businessId}`);
    revalidateTag(`supplier-${supplierId}`);

    return { data: result[0], error: null };
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
