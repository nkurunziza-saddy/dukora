"use server";

import type { InsertWarehouse } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";

import {
  create as createWarehouseRepo,
  getById as getWarehouseByIdRepo,
  update as updateWarehouseRepo,
  getAll as getAllWarehousesRepo,
  remove as removeWarehouseRepo,
  createMany as createManyWarehousesRepo,
} from "../repos/warehouse-repo";

export async function getWarehouses() {
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const warehouses = await getAllWarehousesRepo(currentUser.businessId!);
    if (warehouses.error) {
      return { data: null, error: warehouses.error };
    }
    return { data: warehouses.data, error: null };
  } catch (error) {
    console.error("Error getting warehouses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getWarehouseById(warehouseId: string) {
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!warehouseId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const warehouse = await getWarehouseByIdRepo(
      warehouseId,
      currentUser.businessId!
    );

    if (warehouse.error) {
      return { data: null, error: warehouse.error };
    }

    return { data: warehouse.data, error: null };
  } catch (error) {
    console.error("Error getting warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createWarehouse(
  warehouseData: Omit<InsertWarehouse, "businessId" | "id">
) {
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!warehouseData.name?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const warehouse: InsertWarehouse = {
      ...warehouseData,
      businessId: currentUser.businessId!,
    };
    const { data: resData, error: resError } = await createWarehouseRepo(
      warehouse,
      currentUser.id
    );
    if (resError) {
      return { data: null, error: resError };
    }

    revalidateTag(`warehouses-${currentUser.businessId!}`);

    return { data: resData, error: null };
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function updateWarehouse(
  warehouseId: string,
  updates: Partial<Omit<InsertWarehouse, "id" | "businessId">>
) {
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_UPDATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!warehouseId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const existingWarehouse = await getWarehouseByIdRepo(
    warehouseId,
    currentUser.businessId!
  );

  if (!existingWarehouse) {
    return { data: null, error: ErrorCode.NOT_FOUND };
  }

  try {
    const updatedWarehouse = await updateWarehouseRepo(
      warehouseId,
      currentUser.businessId!,
      currentUser.id,
      updates
    );
    if (updatedWarehouse.error) {
      return { data: null, error: updatedWarehouse.error };
    }

    revalidateTag(`warehouses-${currentUser.businessId!}`);
    revalidateTag(`warehouse-${warehouseId}`);

    return { data: updatedWarehouse.data, error: null };
  } catch (error) {
    console.error("Error updating warehouse:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteWarehouse(warehouseId: string) {
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_DELETE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!warehouseId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    await removeWarehouseRepo(
      warehouseId,
      currentUser.businessId!,
      currentUser.id
    );

    revalidateTag(`warehouses-${currentUser.businessId!}`);
    revalidateTag(`warehouse-${warehouseId}`);

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error deleting warehouse:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createManyWarehouses(
  warehousesData: Omit<InsertWarehouse, "businessId" | "id" | "code">[]
) {
  const currentUser = await getUserIfHasPermission(Permission.WAREHOUSE_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (warehousesData === null) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const warehouses: InsertWarehouse[] = warehousesData.map((warehouse) => ({
      ...warehouse,
      businessId: currentUser.businessId!,
      code: Math.random().toString(36).substr(2, 6).toUpperCase(),
    }));

    const createdWarehouses = await createManyWarehousesRepo(
      warehouses,
      currentUser.id
    );

    revalidateTag(`warehouses-${currentUser.businessId!}`);

    return { data: createdWarehouses, error: null };
  } catch (error) {
    console.error("Error creating warehouses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
