"use server";

import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as purchaseOrderRepo from "../repos/purchase-order-repo";

export const getPurchaseOrdersPaginated = createProtectedAction(
  Permission.PURCHASE_ORDER_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const orders = await purchaseOrderRepo.get_all_paginated(
      user.businessId ?? "",
      page,
      pageSize
    );
    if (orders.error) {
      return { data: null, error: orders.error };
    }
    return { data: orders.data, error: null };
  }
);

export const getPurchaseOrderById = createProtectedAction(
  Permission.PURCHASE_ORDER_VIEW,
  async (_, orderId: string) => {
    if (!orderId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const order = await purchaseOrderRepo.get_by_id(orderId);
    if (order.error) {
      return { data: null, error: order.error };
    }
    return { data: order.data, error: null };
  }
);
