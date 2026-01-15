"use server";

import { revalidateTag } from "next/cache";
import type { InsertSupplier } from "@/lib/schema/schema.types";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as supplierRepo from "@/server/repos/shared/supplier-repo";

export const getSuppliers = createProtectedAction(
  PERMISSION.SUPPLIER_VIEW,
  async (user) => {
    const suppliers = await supplierRepo.get_all(user.businessId ?? "");
    if (suppliers.error) {
      return { data: null, error: suppliers.error };
    }
    return { data: suppliers.data, error: null };
  },
);

export const getSuppliersPaginated = createProtectedAction(
  PERMISSION.SUPPLIER_VIEW,
  async (
    user,
    {
      page,
      pageSize,
      sorting,
      search,
    }: {
      page: number;
      pageSize: number;
      sorting?: { id: string; desc: boolean }[];
      search?: string;
    },
  ) => {
    const suppliers = await supplierRepo.get_all_paginated(
      user.businessId ?? "",
      page,
      pageSize,
      sorting,
      search,
    );
    if (suppliers.error) {
      return { data: null, error: suppliers.error };
    }
    return { data: suppliers.data, error: null };
  },
);

export const getSupplierById = createProtectedAction(
  PERMISSION.SUPPLIER_VIEW,
  async (user, supplierId: string) => {
    if (!supplierId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const supplier = await supplierRepo.get_by_id(
      supplierId,
      user.businessId ?? "",
    );
    if (supplier.error) {
      return { data: null, error: supplier.error };
    }
    return { data: supplier.data, error: null };
  },
);

export const createSupplier = createProtectedAction(
  PERMISSION.SUPPLIER_CREATE,
  async (user, supplierData: Omit<InsertSupplier, "businessId" | "id">) => {
    if (!supplierData.name?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const supplier: InsertSupplier = {
      ...supplierData,
      businessId: user.businessId ?? "",
    };
    const res = await supplierRepo.create(
      user.businessId ?? "",
      user.id,
      supplier,
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`suppliers-${user.businessId}`, "max");
    revalidateTag("suppliers", "max");
    return { data: res.data, error: null };
  },
);

export const updateSupplier = createProtectedAction(
  PERMISSION.SUPPLIER_UPDATE,
  async (
    user,
    {
      supplierId,
      updates,
    }: {
      supplierId: string;
      updates: Partial<Omit<InsertSupplier, "id" | "businessId">>;
    },
  ) => {
    if (!supplierId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const updatedSupplier = await supplierRepo.update(
      supplierId,
      user.businessId ?? "",
      user.id,
      updates,
    );
    if (updatedSupplier.error) {
      return { data: null, error: updatedSupplier.error };
    }
    revalidateTag(`suppliers-${user.businessId}`, "max");
    revalidateTag(`supplier-${supplierId}`, "max");
    return { data: updatedSupplier.data, error: null };
  },
);

export const deleteSupplier = createProtectedAction(
  PERMISSION.SUPPLIER_DELETE,
  async (user, supplierId: string) => {
    if (!supplierId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const res = await supplierRepo.remove(
      supplierId,
      user.businessId ?? "",
      user.id,
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`suppliers-${user.businessId}`, "max");
    revalidateTag(`supplier-${supplierId}`, "max");
    return { data: { success: true }, error: null };
  },
);

export const createManySuppliers = createProtectedAction(
  PERMISSION.SUPPLIER_CREATE,
  async (user, suppliersData: Omit<InsertSupplier, "businessId" | "id">[]) => {
    if (!suppliersData?.length) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const suppliers: InsertSupplier[] = suppliersData.map((supplier) => ({
      ...supplier,
      businessId: user.businessId ?? "",
    }));
    const createdSuppliers = await supplierRepo.create_many(suppliers);
    if (createdSuppliers.error) {
      return { data: null, error: createdSuppliers.error };
    }
    revalidateTag(`suppliers-${user.businessId}`, "max");
    revalidateTag("suppliers", "max");
    return { data: createdSuppliers.data, error: null };
  },
);
