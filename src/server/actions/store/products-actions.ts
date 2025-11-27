"use server";

import { cacheTag, revalidateTag } from "next/cache";
import type { InsertStoreProduct } from "@/lib/types";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as storeProductRepo from "@/server/repos/store/store-product-repo";

async function getCachedAdminProducts(
  businessId: string,
  page: number,
  pageSize: number,
  filters?: {
    isPublished?: boolean;
    featured?: boolean;
    search?: string;
  }
) {
  "use cache";
  cacheTag(`admin-products-${businessId}`);
  return storeProductRepo.get_admin_store_products(
    businessId,
    page,
    pageSize,
    filters
  );
}

export const getAdminStoreProducts = createProtectedAction(
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
        isPublished?: boolean;
        featured?: boolean;
        search?: string;
      };
    }
  ) => {
    const result = await getCachedAdminProducts(
      user.businessId ?? "",
      page,
      pageSize,
      filters
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

async function getCachedAdminProduct(
  businessId: string,
  storeProductId: string
) {
  "use cache";
  cacheTag(`admin-product-${storeProductId}`);
  return storeProductRepo.get_store_product_by_id(storeProductId, businessId);
}

export const getStoreProductById = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user, storeProductId: string) => {
    if (!storeProductId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await getCachedAdminProduct(
      storeProductId,
      user.businessId ?? ""
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

async function getCachedAvailableInventory(
  businessId: string,
  page: number,
  pageSize: number
) {
  "use cache";
  cacheTag(`available-inventory-${businessId}`);
  return storeProductRepo.get_available_inventory_products(
    businessId,
    page,
    pageSize
  );
}

export const getAvailableInventoryProducts = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const result = await getCachedAvailableInventory(
      user.businessId ?? "",
      page,
      pageSize
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

// admin mutations

export const publishProductToStore = createProtectedAction(
  PERMISSION.PRODUCT_CREATE,
  async (
    user,
    {
      productId,
      options,
    }: {
      productId: string;
      options?: {
        storePrice?: number;
        compareAtPrice?: number;
        storeTitle?: string;
        storeDescription?: string;
        shortDescription?: string;
        images?: string[];
        tags?: string[];
        featured?: boolean;
        featuredOrder?: number;
      };
    }
  ) => {
    if (!productId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeProductRepo.publish_product(
      productId,
      user.businessId ?? "",
      user.id,
      options
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`admin-products-${user.businessId}`, "max");
    revalidateTag(`public-products-${user.businessId}`, "max");
    if (options?.featured) {
      revalidateTag(`featured-products-${user.businessId}`, "max");
    }
    return { data: result.data, error: null };
  }
);

export const unpublishProduct = createProtectedAction(
  PERMISSION.PRODUCT_DELETE,
  async (user, storeProductId: string) => {
    if (!storeProductId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeProductRepo.unpublish_product(
      storeProductId,
      user.businessId ?? "",
      user.id
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`admin-products-${user.businessId}`, "max");
    revalidateTag(`public-products-${user.businessId}`, "max");
    revalidateTag(`featured-products-${user.businessId}`, "max");
    revalidateTag(`admin-product-${storeProductId}`, "max");
    return { data: result.data, error: null };
  }
);

export const updateStoreProduct = createProtectedAction(
  PERMISSION.PRODUCT_UPDATE,
  async (
    user,
    {
      storeProductId,
      updates,
    }: {
      storeProductId: string;
      updates: Partial<InsertStoreProduct>;
    }
  ) => {
    if (!storeProductId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeProductRepo.update_store_product(
      storeProductId,
      user.businessId ?? "",
      user.id,
      updates
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`admin-products-${user.businessId}`, "max");
    revalidateTag(`public-products-${user.businessId}`, "max");
    revalidateTag(`admin-product-${storeProductId}`, "max");
    if ("featured" in updates) {
      revalidateTag(`featured-products-${user.businessId}`, "max");
    }
    return { data: result.data, error: null };
  }
);

export const bulkPublishProducts = createProtectedAction(
  PERMISSION.PRODUCT_CREATE,
  async (
    user,
    {
      productIds,
      options,
    }: {
      productIds: string[];
      options?: { featured?: boolean };
    }
  ) => {
    if (!productIds?.length) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeProductRepo.bulk_publish_products(
      productIds,
      user.businessId ?? "",
      user.id,
      options
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`admin-products-${user.businessId}`, "max");
    revalidateTag(`public-products-${user.businessId}`, "max");
    if (options?.featured) {
      revalidateTag(`featured-products-${user.businessId}`, "max");
    }
    return { data: result.data, error: null };
  }
);

export const updateProductImages = createProtectedAction(
  PERMISSION.PRODUCT_UPDATE,
  async (
    user,
    { storeProductId, images }: { storeProductId: string; images: string[] }
  ) => {
    if (!storeProductId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeProductRepo.update_product_images(
      storeProductId,
      user.businessId ?? "",
      images
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`admin-product-${storeProductId}`, "max");
    revalidateTag(`public-product-slug-${storeProductId}`, "max");
    return { data: result.data, error: null };
  }
);

export const syncProductStock = createProtectedAction(
  PERMISSION.PRODUCT_UPDATE,
  async (user, storeProductId: string) => {
    if (!storeProductId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const result = await storeProductRepo.update_cached_stock(
      storeProductId,
      user.businessId ?? ""
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`admin-product-${storeProductId}`, "max");
    revalidateTag(`available-inventory-${user.businessId}`, "max");
    revalidateTag(`product-availability-${storeProductId}`, "max");
    return { data: result.data, error: null };
  }
);

// public

async function getCachedStoreProducts(
  businessId: string,
  page: number,
  pageSize: number,
  filters?: {
    search?: string;
    tags?: string[];
    featured?: boolean;
    sortBy?: "viewCount" | "soldCount" | "storePrice" | "createdAt";
    sortOrder?: "asc" | "desc";
  }
) {
  "use cache";
  cacheTag(`public-products-${businessId}`);
  return storeProductRepo.get_store_products_paginated(
    businessId,
    page,
    pageSize,
    filters
  );
}

export const getStoreProducts = async (
  businessId: string,
  page: number,
  pageSize: number,
  filters?: {
    search?: string;
    tags?: string[];
    featured?: boolean;
    sortBy?: "viewCount" | "soldCount" | "storePrice" | "createdAt";
    sortOrder?: "asc" | "desc";
  }
) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }
  const result = await getCachedStoreProducts(
    businessId,
    page,
    pageSize,
    filters
  );
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};

async function getCachedFeatured(businessId: string, limit: number) {
  "use cache";
  cacheTag(`featured-products-${businessId}`);
  return storeProductRepo.get_featured_products(businessId, limit);
}

export const getFeaturedProducts = async (businessId: string, limit = 8) => {
  if (!businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  const result = await getCachedFeatured(businessId, limit);
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};

async function getCachedProductBySlug(slug: string, businessId: string) {
  "use cache";
  cacheTag(`public-product-slug-${businessId}:${slug}`);
  return storeProductRepo.get_store_product_by_slug(slug, businessId);
}

export const getStoreProductBySlug = async (
  slug: string,
  businessId: string
) => {
  if (!slug || !businessId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  const result = await getCachedProductBySlug(slug, businessId);
  if (result.error) {
    return { data: null, error: result.error };
  }

  if (result.data?.id) {
    await storeProductRepo.increment_view_count(result.data.id);
  }

  return { data: result.data, error: null };
};

export const checkProductAvailability = async (
  storeProductId: string,
  quantity: number
) => {
  if (!storeProductId || quantity <= 0) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  const result = await storeProductRepo.check_product_availability(
    storeProductId,
    quantity
  );
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};
