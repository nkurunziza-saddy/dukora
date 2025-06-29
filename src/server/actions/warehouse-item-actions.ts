"use server";

import type { InsertWarehouseItem } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import {
  getAll as getAllWarehouseItemsRepo,
  getById as getWarehouseItemByIdRepo,
  create as createWarehouseItemRepo,
  update as updateWarehouseItemRepo,
  remove as removeWarehouseItemRepo,
  createMany as createManyWarehouseItemsRepo,
} from "@/server/repos/warehouse-item-repo";

export async function getWarehouseItems() {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_VIEW
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const warehouseItems = await getAllWarehouseItemsRepo(
      currentUser.businessId!
    );
    if (warehouseItems.error) {
      return { data: null, error: warehouseItems.error };
    }
    return { data: warehouseItems.data, error: null };
  } catch (error) {
    console.error("Error getting warehouseItems:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getWarehouseItemById(warehouseItemId: string) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_VIEW
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!warehouseItemId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const warehouseItem = await getWarehouseItemByIdRepo(warehouseItemId);

    if (warehouseItem.error) {
      return { data: null, error: warehouseItem.error };
    }

    return { data: warehouseItem, error: null };
  } catch (error) {
    console.error("Error getting warehouseItem:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createWarehouseItem(
  warehouseItemData: Omit<InsertWarehouseItem, "businessId" | "id">
) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_CREATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const warehouseItem: InsertWarehouseItem = {
      ...warehouseItemData,
    };

    const res = await createWarehouseItemRepo(
      currentUser.businessId!,
      currentUser.id,
      warehouseItem
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`warehouseItems-${currentUser.businessId!}`);

    return { data: res.data, error: null };
  } catch (error) {
    console.error("Error creating warehouseItem:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function updateWarehouseItem(
  warehouseItemId: string,
  updates: Partial<Omit<InsertWarehouseItem, "id" | "businessId">>
) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_UPDATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!warehouseItemId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const updatedWarehouseItem = await updateWarehouseItemRepo(
      currentUser.businessId!,
      warehouseItemId,
      currentUser.id,
      updates
    );
    if (updatedWarehouseItem.error) {
      return { data: null, error: updatedWarehouseItem.error };
    }

    revalidateTag(`warehouseItems-${currentUser.businessId!}`);
    revalidateTag(`warehouseItem-${warehouseItemId}`);

    return { data: updatedWarehouseItem.data, error: null };
  } catch (error) {
    console.error("Error updating warehouseItem:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteWarehouseItem(warehouseItemId: string) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_DELETE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!warehouseItemId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    await removeWarehouseItemRepo(
      warehouseItemId,
      currentUser.businessId!,
      currentUser.id
    );

    revalidateTag(`warehouseItems-${currentUser.businessId!}`);
    revalidateTag(`warehouseItem-${warehouseItemId}`);

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error deleting warehouseItem:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createManyWarehouseItems(
  warehouseItemsData: Omit<InsertWarehouseItem, "businessId" | "id">[]
) {
  const currentUser = await getUserIfHasPermission(
    Permission.WAREHOUSE_ITEM_CREATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!warehouseItemsData?.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const warehouseItems: InsertWarehouseItem[] = warehouseItemsData.map(
      (warehouseItem, index) => ({
        ...warehouseItem,
        businessId: currentUser.businessId!,
        id: `prod-${Date.now()}-${index}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      })
    );

    const createdWarehouseItems = await createManyWarehouseItemsRepo(
      warehouseItems
    );

    revalidateTag(`warehouseItems-${currentUser.businessId!}`);

    return { data: createdWarehouseItems, error: null };
  } catch (error) {
    console.error("Error creating warehouseItems:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
