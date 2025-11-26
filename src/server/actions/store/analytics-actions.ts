"use server";

import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as storeMetricsRepo from "../repos/store-metrics-repo";

export const getStorePerformance = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user, { startDate, endDate }: { startDate: Date; endDate: Date }) => {
    const result = await storeMetricsRepo.get_store_performance_metrics(
      user.businessId ?? "",
      startDate,
      endDate
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

export const getProductPerformance = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (
    user,
    {
      storeProductId,
      startDate,
      endDate,
    }: {
      storeProductId: string;
      startDate: Date;
      endDate: Date;
    }
  ) => {
    if (!storeProductId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeMetricsRepo.get_product_performance_metrics(
      storeProductId,
      startDate,
      endDate
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

export const getTopProducts = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (
    user,
    {
      startDate,
      endDate,
      limit = 10,
      sortBy = "revenue",
    }: {
      startDate: Date;
      endDate: Date;
      limit?: number;
      sortBy?: "revenue" | "orders" | "views";
    }
  ) => {
    const result = await storeMetricsRepo.get_top_performing_products(
      user.businessId ?? "",
      startDate,
      endDate,
      limit,
      sortBy
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

export const getRevenueTrends = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (
    user,
    {
      startDate,
      endDate,
      groupBy = "day",
    }: {
      startDate: Date;
      endDate: Date;
      groupBy?: "day" | "week" | "month";
    }
  ) => {
    const result = await storeMetricsRepo.get_revenue_trends(
      user.businessId ?? "",
      startDate,
      endDate,
      groupBy
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

export const getTodaysMetrics = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user) => {
    const result = await storeMetricsRepo.get_todays_metrics(
      user.businessId ?? ""
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

export const trackProductView = async (
  businessId: string,
  storeProductId: string
) => {
  if (!businessId || !storeProductId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }
  const result = await storeMetricsRepo.record_product_view(
    businessId,
    storeProductId
  );
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};

export const trackAddToCart = async (
  businessId: string,
  storeProductId: string
) => {
  if (!businessId || !storeProductId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }
  const result = await storeMetricsRepo.record_add_to_cart(
    businessId,
    storeProductId
  );
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};
