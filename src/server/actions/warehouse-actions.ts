"use server";

import { revalidateTag } from "next/cache";
import type {
  InsertWarehouse,
  SelectWarehouse,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";

import * as warehouseRepo from "../repos/warehouse-repo";

export const getWarehouses = createProtectedAction(
  Permission.WAREHOUSE_VIEW,
  async (user) => {
    const warehouses = await warehouseRepo.get_all(user.businessId ?? "");
    if (warehouses.error) {
      return { data: null, error: warehouses.error };
    }
    return { data: warehouses.data, error: null };
  },
);
export const getWarehousesPaginated = createProtectedAction(
  Permission.WAREHOUSE_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const warehouses = await warehouseRepo.get_all_paginated(
      user.businessId ?? "",
      page,
      pageSize,
    );
    if (warehouses.error) {
      return { data: null, error: warehouses.error };
    }
    return { data: warehouses.data, error: null };
  },
);

export const getWarehouseById = createProtectedAction(
  Permission.WAREHOUSE_VIEW,
  async (user, warehouseId: string) => {
    if (!warehouseId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const warehouse = await warehouseRepo.get_by_id(
      warehouseId,
      user.businessId ?? "",
    );
    if (warehouse.error) {
      return { data: null, error: warehouse.error };
    }
    return { data: warehouse.data, error: null };
  },
);

export const createWarehouse = createProtectedAction(
  Permission.WAREHOUSE_CREATE,
  async (user, warehouseData: Omit<InsertWarehouse, "businessId" | "id">) => {
    if (!warehouseData.name?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const warehouse: InsertWarehouse = {
      ...warehouseData,
      businessId: user.businessId ?? "",
    };
    const { data: resData, error: resError } = await warehouseRepo.create(
      warehouse,
      user.id,
    );
    if (resError) {
      return { data: null, error: resError };
    }
    revalidateTag(`warehouses-${user.businessId}`, "max");
    revalidateTag("warehouses", "max");
    return { data: resData, error: null };
  },
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
    },
  ) => {
    if (!warehouseId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedWarehouse = await warehouseRepo.update(
      warehouseId,
      user.businessId ?? "",
      user.id,
      updates,
    );
    if (updatedWarehouse.error) {
      return { data: null, error: updatedWarehouse.error };
    }
    revalidateTag(`warehouse-${updatedWarehouse.data.id}`, "max");
    revalidateTag(`warehouses-${user.businessId}`, "max");
    return { data: updatedWarehouse.data, error: null };
  },
);

export const deleteWarehouse = createProtectedAction(
  Permission.WAREHOUSE_DELETE,
  async (user, warehouseId: string) => {
    if (!warehouseId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const deleted = await warehouseRepo.remove(
      warehouseId,
      user.businessId ?? "",
      user.id,
    );
    revalidateTag(`warehouse-${deleted.data?.id}`, "max");
    revalidateTag(`warehouses-${user.businessId}`, "max");
    return { data: { success: true }, error: null };
  },
);

export const createManyWarehouses = createProtectedAction(
  Permission.WAREHOUSE_CREATE,
  async (
    user,
    data: {
      created: Omit<InsertWarehouse, "businessId" | "id" | "code">[];
      deleted: SelectWarehouse[];
    },
  ) => {
    if (data === null) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const warehouses: InsertWarehouse[] = data.created.map((warehouse) => ({
      ...warehouse,
      businessId: user.businessId ?? "",
      code: Math.random().toString(36).substr(2, 6).toUpperCase(),
    }));
    const createdWarehouses = await warehouseRepo.create_many(
      warehouses,
      user.id,
    );
    const deleteWarehouses = await Promise.all(
      data.deleted.map((warehouse) => {
        return warehouseRepo.remove(
          warehouse.id,
          warehouse.businessId,
          user.id,
        );
      }),
    );
    revalidateTag(`warehouses-${user.businessId}`, "max");
    revalidateTag("warehouses", "max");
    return { data: { createdWarehouses, deleteWarehouses }, error: null };
  },
);
