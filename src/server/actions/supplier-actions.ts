"use server";

import type { InsertSupplier } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import {
  getAll as getAllSuppliersRepo,
  getById as getSupplierByIdRepo,
  create as createSupplierRepo,
  update as updateSupplierRepo,
  remove as removeSupplierRepo,
  createMany as createManySuppliersRepo,
} from "../repos/supplier-repo";

export async function getSuppliers() {
  const currentUser = await getUserIfHasPermission(Permission.SUPPLIER_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const suppliers = await getAllSuppliersRepo(currentUser.businessId!);
    if (suppliers.error) {
      return { data: null, error: suppliers.error };
    }
    return { data: suppliers.data, error: null };
  } catch (error) {
    console.error("Error getting suppliers:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getSupplierById(supplierId: string) {
  const currentUser = await getUserIfHasPermission(Permission.SUPPLIER_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!supplierId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const supplier = await getSupplierByIdRepo(
      supplierId,
      currentUser.businessId!
    );

    if (supplier.error) {
      return { data: null, error: supplier.error };
    }

    return { data: supplier, error: null };
  } catch (error) {
    console.error("Error getting supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createSupplier(
  supplierData: Omit<InsertSupplier, "businessId" | "id">
) {
  const currentUser = await getUserIfHasPermission(Permission.SUPPLIER_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!supplierData.name?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const supplier: InsertSupplier = {
      ...supplierData,
      businessId: currentUser.businessId!,
    };

    const res = await createSupplierRepo(
      currentUser.businessId!,
      currentUser.id,
      supplier
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`suppliers-${currentUser.businessId!}`);

    return { data: res.data, error: null };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function updateSupplier(
  supplierId: string,
  updates: Partial<Omit<InsertSupplier, "id" | "businessId">>
) {
  const currentUser = await getUserIfHasPermission(Permission.SUPPLIER_UPDATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!supplierId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const updatedSupplier = await updateSupplierRepo(
      supplierId,
      currentUser.businessId!,
      currentUser.id,
      updates
    );
    if (updatedSupplier.error) {
      return { data: null, error: updatedSupplier.error };
    }

    revalidateTag(`suppliers-${currentUser.businessId!}`);
    revalidateTag(`supplier-${supplierId}`);

    return { data: updatedSupplier.data, error: null };
  } catch (error) {
    console.error("Error updating supplier:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.SUPPLIER_NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteSupplier(supplierId: string) {
  const currentUser = await getUserIfHasPermission(Permission.SUPPLIER_DELETE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!supplierId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    await removeSupplierRepo(
      supplierId,
      currentUser.businessId!,
      currentUser.id
    );

    revalidateTag(`suppliers-${currentUser.businessId!}`);
    revalidateTag(`supplier-${supplierId}`);

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error deleting supplier:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.SUPPLIER_NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createManySuppliers(
  suppliersData: Omit<InsertSupplier, "businessId" | "id">[]
) {
  const currentUser = await getUserIfHasPermission(Permission.SUPPLIER_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!suppliersData?.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const suppliers: InsertSupplier[] = suppliersData.map((supplier) => ({
      ...supplier,
      businessId: currentUser.businessId!,
    }));

    const createdSuppliers = await createManySuppliersRepo(suppliers);

    revalidateTag(`suppliers-${currentUser.businessId!}`);

    return { data: createdSuppliers, error: null };
  } catch (error) {
    console.error("Error creating suppliers:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
