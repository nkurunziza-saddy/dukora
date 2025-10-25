"use server";

import type { InsertSupplier } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as supplierRepo from "../repos/supplier-repo";
import { revalidateTag } from "next/cache";

export const getSuppliers = createProtectedAction(
  Permission.SUPPLIER_VIEW,
  async (user) => {
    const suppliers = await supplierRepo.get_all(user.businessId ?? "");
    if (suppliers.error) {
      return { data: null, error: suppliers.error };
    }
    return { data: suppliers.data, error: null };
  },
);

export const getSuppliersPaginated = createProtectedAction(
  Permission.SUPPLIER_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const suppliers = await supplierRepo.get_all_paginated(
      user.businessId ?? "",
      page,
      pageSize,
    );
    if (suppliers.error) {
      return { data: null, error: suppliers.error };
    }
    return { data: suppliers.data, error: null };
  },
);

export const getSupplierById = createProtectedAction(
  Permission.SUPPLIER_VIEW,
  async (user, supplierId: string) => {
    if (!supplierId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
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
  Permission.SUPPLIER_CREATE,
  async (user, supplierData: Omit<InsertSupplier, "businessId" | "id">) => {
    if (!supplierData.name?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
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
  Permission.SUPPLIER_UPDATE,
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
      return { data: null, error: ErrorCode.MISSING_INPUT };
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
  Permission.SUPPLIER_DELETE,
  async (user, supplierId: string) => {
    if (!supplierId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
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
  Permission.SUPPLIER_CREATE,
  async (user, suppliersData: Omit<InsertSupplier, "businessId" | "id">[]) => {
    if (!suppliersData?.length) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
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
