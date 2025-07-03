"use server";

import type { InsertWarehouse } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidatePath } from "next/cache";
import { createProtectedAction } from "@/server/helpers/action-factory";

import {
  create as createWarehouseRepo,
  getById as getWarehouseByIdRepo,
  update as updateWarehouseRepo,
  getAll as getAllWarehousesRepo,
  remove as removeWarehouseRepo,
  createMany as createManyWarehousesRepo,
} from "../repos/warehouse-repo";

export const getWarehouses = createProtectedAction(
  Permission.WAREHOUSE_VIEW,
  async (user) => {
    const warehouses = await getAllWarehousesRepo(user.businessId!);
    if (warehouses.error) {
      return { data: null, error: warehouses.error };
    }
    return { data: warehouses.data, error: null };
  }
);

export const getWarehouseById = createProtectedAction(
  Permission.WAREHOUSE_VIEW,
  async (user, warehouseId: string) => {
    if (!warehouseId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const warehouse = await getWarehouseByIdRepo(warehouseId, user.businessId!);
    if (warehouse.error) {
      return { data: null, error: warehouse.error };
    }
    return { data: warehouse.data, error: null };
  }
);

export const createWarehouse = createProtectedAction(
  Permission.WAREHOUSE_CREATE,
  async (user, warehouseData: Omit<InsertWarehouse, "businessId" | "id">) => {
    if (!warehouseData.name?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const warehouse: InsertWarehouse = {
      ...warehouseData,
      businessId: user.businessId!,
    };
    const { data: resData, error: resError } = await createWarehouseRepo(
      warehouse,
      user.id
    );
    if (resError) {
      return { data: null, error: resError };
    }
    revalidatePath("/scheduler");
    revalidatePath("/dashboard");
    return { data: resData, error: null };
  }
);

export const updateWarehouse = createProtectedAction(
  Permission.WAREHOUSE_UPDATE,
  async (
    user,
    {
      warehouseId,
      updates,
    }: {
      warehouseId: string;
      updates: Partial<Omit<InsertWarehouse, "id" | "businessId">>;
    }
  ) => {
    if (!warehouseId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedWarehouse = await updateWarehouseRepo(
      warehouseId,
      user.businessId!,
      user.id,
      updates
    );
    if (updatedWarehouse.error) {
      return { data: null, error: updatedWarehouse.error };
    }
    revalidatePath("/", "layout");
    return { data: updatedWarehouse.data, error: null };
  }
);

export const deleteWarehouse = createProtectedAction(
  Permission.WAREHOUSE_DELETE,
  async (user, warehouseId: string) => {
    if (!warehouseId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    await removeWarehouseRepo(warehouseId, user.businessId!, user.id);
    revalidatePath("/", "layout");
    return { data: { success: true }, error: null };
  }
);

export const createManyWarehouses = createProtectedAction(
  Permission.WAREHOUSE_CREATE,
  async (
    user,
    warehousesData: Omit<InsertWarehouse, "businessId" | "id" | "code">[]
  ) => {
    if (warehousesData === null) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const warehouses: InsertWarehouse[] = warehousesData.map((warehouse) => ({
      ...warehouse,
      businessId: user.businessId!,
      code: Math.random().toString(36).substr(2, 6).toUpperCase(),
    }));
    const createdWarehouses = await createManyWarehousesRepo(
      warehouses,
      user.id
    );
    revalidatePath("/", "layout");
    return { data: createdWarehouses, error: null };
  }
);
