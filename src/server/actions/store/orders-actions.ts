"use server";

import { revalidateTag } from "next/cache";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as inventorySyncRepo from "@/server/repos/inventory/inventory-sync-repo";
import * as storeOrderRepo from "@/server/repos/store/store-order-repo";
import * as storeProductRepo from "@/server/repos/store/store-product-repo";

/**
 * Admin Actions - Protected
 */

export const getStoreOrders = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (
    user,
    {
      page,
      pageSize,
      filters,
    }: {
      page: number;
      pageSize: number;
      filters?: {
        search?: string;
        status?: string;
        fulfillmentStatus?: string;
      };
    },
  ) => {
    const result = await storeOrderRepo.get_store_orders_paginated(
      user.businessId ?? "",
      page,
      pageSize,
      filters,
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  },
);

export const getOrderById = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user, orderId: string) => {
    if (!orderId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeOrderRepo.get_order_by_id(
      orderId,
      user.businessId ?? "",
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  },
);

export const getPendingFulfillmentOrders = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user, warehouseId?: string) => {
    const result = await storeOrderRepo.get_pending_fulfillment_orders(
      user.businessId ?? "",
      warehouseId,
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  },
);

export const updateOrderStatus = createProtectedAction(
  PERMISSION.PRODUCT_UPDATE,
  async (user, { orderId, status }: { orderId: string; status: string }) => {
    if (!orderId?.trim() || !status) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeOrderRepo.update_order_status(
      orderId,
      user.businessId ?? "",
      status,
      user.id,
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`store-orders-${user.businessId}`, "max");
    revalidateTag(`store-order-${orderId}`, "max");
    return { data: result.data, error: null };
  },
);

export const updateFulfillmentStatus = createProtectedAction(
  PERMISSION.PRODUCT_UPDATE,
  async (
    user,
    {
      orderId,
      fulfillmentStatus,
      updates,
    }: {
      orderId: string;
      fulfillmentStatus: string;
      updates?: {
        trackingNumber?: string;
        trackingUrl?: string;
        estimatedDeliveryDate?: Date;
        actualDeliveryDate?: Date;
      };
    },
  ) => {
    if (!orderId?.trim() || !fulfillmentStatus) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeOrderRepo.update_fulfillment_status(
      orderId,
      user.businessId ?? "",
      fulfillmentStatus,
      user.id,
      updates,
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`store-orders-${user.businessId}`, "max");
    revalidateTag(`store-order-${orderId}`, "max");
    return { data: result.data, error: null };
  },
);

export const cancelOrder = createProtectedAction(
  PERMISSION.PRODUCT_DELETE,
  async (user, { orderId, reason }: { orderId: string; reason: string }) => {
    if (!orderId?.trim() || !reason) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeOrderRepo.cancel_order(
      orderId,
      user.businessId ?? "",
      user.id,
      reason,
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`store-orders-${user.businessId}`, "max");
    revalidateTag(`store-order-${orderId}`, "max");
    return { data: result.data, error: null };
  },
);

export const processRefund = createProtectedAction(
  PERMISSION.PRODUCT_UPDATE,
  async (
    user,
    {
      orderId,
      refundAmount,
      refundStatus,
    }: {
      orderId: string;
      refundAmount: number;
      refundStatus: "PARTIAL" | "FULL";
    },
  ) => {
    if (!orderId?.trim() || refundAmount <= 0) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeOrderRepo.process_refund(
      orderId,
      user.businessId ?? "",
      refundAmount,
      refundStatus,
      user.id,
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`store-orders-${user.businessId}`, "max");
    revalidateTag(`store-order-${orderId}`, "max");
    return { data: result.data, error: null };
  },
);

/**
 * Customer Actions - Public/Protected by userId
 */

export const createOrderFromCart = async (orderData: {
  businessId: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  billingAddress?: string;
  items: {
    storeProductId: string;
    warehouseItemId: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  fulfillmentWarehouseId?: string;
  stripePaymentIntentId?: string;
  paymentStatus?: string;
}) => {
  if (!orderData.businessId || !orderData.items.length) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  // Create order
  const result = await storeOrderRepo.create_store_order(
    orderData,
    orderData.userId || "system",
  );

  if (result.error) {
    return { data: null, error: result.error };
  }

  // Allocate inventory if payment succeeded
  if (orderData.paymentStatus === "succeeded" && result.data) {
    await inventorySyncRepo.allocate_inventory_to_order(
      result.data.id,
      orderData.items,
      orderData.businessId,
      orderData.userId || "system",
    );

    // Update sold count for products
    for (const item of orderData.items) {
      storeProductRepo.increment_sold_count(item.storeProductId, item.quantity);
    }
  }

  revalidateTag(`store-orders-${orderData.businessId}`, "max");
  return { data: result.data, error: null };
};

export const getCustomerOrders = async (
  userId: string,
  businessId: string,
  page: number = 1,
  pageSize: number = 10,
) => {
  if (!userId || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }
  const result = await storeOrderRepo.get_customer_orders(
    userId,
    businessId,
    page,
    pageSize,
  );
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};

export const trackOrder = async (
  trackingNumber: string,
  businessId: string,
) => {
  if (!trackingNumber || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }
  const result = await storeOrderRepo.get_order_by_tracking_number(
    trackingNumber,
    businessId,
  );
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};
