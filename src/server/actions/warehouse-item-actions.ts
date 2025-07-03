"use server";

import type {
  InsertWarehouseItem,
  SelectProduct,
  SelectWarehouseItem,
} from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { createProtectedAction } from "@/server/helpers/action-factory";
import {
  get_all as getAllWarehouseItemsRepo,
  get_by_id as getWarehouseItemByIdRepo,
  create as createWarehouseItemRepo,
  update as updateWarehouseItemRepo,
  remove as removeWarehouseItemRepo,
  create_many as createManyWarehouseItemsRepo,
  get_all_by_business_id as getAllWarehouseItemsByBusinessIdRepo,
} from "@/server/repos/warehouse-item-repo";

export const getWarehouseItems = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (user) => {
    const warehouseItems = await getAllWarehouseItemsRepo(user.businessId!);
    if (warehouseItems.error) {
      return { data: null, error: warehouseItems.error };
    }
    return { data: warehouseItems.data, error: null };
  }
);

export const getWarehouseItemsByBusiness = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (user) => {
    const warehouseItemsResult = await getAllWarehouseItemsByBusinessIdRepo(
      user.businessId!
    );
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
      })
    );
    return { data: warehouseItems, error: null };
  }
);

export const getWarehouseItemById = createProtectedAction(
  Permission.WAREHOUSE_ITEM_VIEW,
  async (user, warehouseItemId: string) => {
    if (!warehouseItemId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const warehouseItem = await getWarehouseItemByIdRepo(warehouseItemId);
    if (warehouseItem.error) {
      return { data: null, error: warehouseItem.error };
    }
    return { data: warehouseItem, error: null };
  }
);

export const createWarehouseItem = createProtectedAction(
  Permission.WAREHOUSE_ITEM_CREATE,
  async (
    user,
    warehouseItemData: Omit<InsertWarehouseItem, "businessId" | "id">
  ) => {
    const warehouseItem: InsertWarehouseItem = {
      ...warehouseItemData,
    };
    const res = await createWarehouseItemRepo(
      user.businessId!,
      user.id,
      warehouseItem
    );
    if (res.error) {
      return { data: null, error: res.error };
    }

    return { data: res.data, error: null };
  }
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
    }
  ) => {
    if (!warehouseItemId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedWarehouseItem = await updateWarehouseItemRepo(
      user.businessId!,
      warehouseItemId,
      user.id,
      updates
    );
    if (updatedWarehouseItem.error) {
      return { data: null, error: updatedWarehouseItem.error };
    }

    return { data: updatedWarehouseItem.data, error: null };
  }
);

export const deleteWarehouseItem = createProtectedAction(
  Permission.WAREHOUSE_ITEM_DELETE,
  async (user, warehouseItemId: string) => {
    if (!warehouseItemId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    await removeWarehouseItemRepo(warehouseItemId, user.businessId!, user.id);

    return { data: { success: true }, error: null };
  }
);

export const createManyWarehouseItems = createProtectedAction(
  Permission.WAREHOUSE_ITEM_CREATE,
  async (
    user,
    warehouseItemsData: Omit<InsertWarehouseItem, "businessId" | "id">[]
  ) => {
    if (!warehouseItemsData?.length) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const warehouseItems: InsertWarehouseItem[] = warehouseItemsData.map(
      (warehouseItem) => ({
        ...warehouseItem,
        businessId: user.businessId!,
      })
    );
    const createdWarehouseItems =
      await createManyWarehouseItemsRepo(warehouseItems);

    return { data: createdWarehouseItems, error: null };
  }
);
