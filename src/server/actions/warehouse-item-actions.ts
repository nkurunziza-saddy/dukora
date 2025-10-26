"use server";

import { revalidateTag } from "next/cache";
import type {
  InsertWarehouseItem,
  SelectProduct,
  SelectWarehouseItem,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as warehouseItemsRepo from "@/server/repos/warehouse-item-repo";

export const getWarehouseItems = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (user) => {
    const warehouseItems = await warehouseItemsRepo.get_all(
      user.businessId ?? "",
    );
    if (warehouseItems.error) {
      return { data: null, error: warehouseItems.error };
    }
    return { data: warehouseItems.data, error: null };
  },
);
export const getWarehouseItemsPaginated = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const warehouseItems = await warehouseItemsRepo.get_all_paginated(
      user.businessId ?? "",
      page,
      pageSize,
    );
    if (warehouseItems.error) {
      return { data: null, error: warehouseItems.error };
    }
    return { data: warehouseItems.data, error: null };
  },
);

export const getWarehouseItemsByBusiness = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (user) => {
    const warehouseItemsResult =
      await warehouseItemsRepo.get_all_by_business_id(user.businessId ?? "");
    if (warehouseItemsResult.error) {
      return { data: null, error: warehouseItemsResult.error };
    }
    const warehouseItems = (warehouseItemsResult.data ?? []).map(
      (item: {
        warehouseItem: SelectWarehouseItem;
        product: SelectProduct;
      }) => ({
        ...item.warehouseItem,
        product: item.product,
      }),
    );
    return { data: warehouseItems, error: null };
  },
);

export const getWarehouseItemById = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (_user, warehouseItemId: string) => {
    if (!warehouseItemId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const warehouseItem = await warehouseItemsRepo.get_by_id(warehouseItemId);
    if (warehouseItem.error) {
      return { data: null, error: warehouseItem.error };
    }
    return { data: warehouseItem, error: null };
  },
);

export const createWarehouseItem = createProtectedAction(
  Permission.WAREHOUSE_ITEM_CREATE,
  async (
    user,
    warehouseItemData: Omit<InsertWarehouseItem, "businessId" | "id">,
  ) => {
    const warehouseItem: InsertWarehouseItem = {
      ...warehouseItemData,
    };
    const res = await warehouseItemsRepo.create(
      user.businessId ?? "",
      user.id,
      warehouseItem,
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`warehouse-item-${user.businessId}`, "max");
    revalidateTag("warehouse-items", "max");
    return { data: res.data, error: null };
  },
);

export const updateWarehouseItem = createProtectedAction(
  Permission.WAREHOUSE_ITEM_UPDATE,
  async (
    user,
    {
      warehouseItemId,
      updates,
    }: {
      warehouseItemId: string;
      updates: Partial<Omit<InsertWarehouseItem, "id" | "businessId">>;
    },
  ) => {
    if (!warehouseItemId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedWarehouseItem = await warehouseItemsRepo.update(
      user.businessId ?? "",
      warehouseItemId,
      user.id,
      updates,
    );
    if (updatedWarehouseItem.error) {
      return { data: null, error: updatedWarehouseItem.error };
    }
    revalidateTag(`warehouse-item-${updatedWarehouseItem.data.id}`, "max");
    revalidateTag(`warehouse-items-${user.businessId}`, "max");
    return { data: updatedWarehouseItem.data, error: null };
  },
);

export const deleteWarehouseItem = createProtectedAction(
  Permission.WAREHOUSE_ITEM_DELETE,
  async (user, warehouseItemId: string) => {
    if (!warehouseItemId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const res = await warehouseItemsRepo.remove(
      warehouseItemId,
      user.businessId ?? "",
      user.id,
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`warehouse-item-${warehouseItemId}`, "max");
    revalidateTag(`warehouse-items-${user.businessId}`, "max");
    return { data: { success: true }, error: null };
  },
);

export const createManyWarehouseItems = createProtectedAction(
  Permission.WAREHOUSE_ITEM_CREATE,
  async (
    user,
    warehouseItemsData: Omit<InsertWarehouseItem, "businessId" | "id">[],
  ) => {
    if (!warehouseItemsData?.length) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const warehouseItems: InsertWarehouseItem[] = warehouseItemsData.map(
      (warehouseItem) => ({
        ...warehouseItem,
        businessId: user.businessId ?? "",
      }),
    );
    const createdWarehouseItems =
      await warehouseItemsRepo.create_many(warehouseItems);
    if (createdWarehouseItems.error) {
      return { data: null, error: createdWarehouseItems.error };
    }
    revalidateTag(`warehouse-items-${user.businessId}`, "max");
    revalidateTag("warehouse-items", "max");
    return { data: createdWarehouseItems.data, error: null };
  },
);
