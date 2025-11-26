"use server";

import { revalidateTag } from "next/cache";
import type { InsertProduct } from "@/lib/schema/schema-types";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as productRepo from "../repos/product-repo";
import type { StoreProductFilters } from "../repos/product-repo/product-query-repo";

export const getProducts = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user) => {
    const products = await productRepo.get_all(user.businessId ?? "");
    if (products.error) {
      return { data: null, error: products.error };
    }
    return { data: products.data, error: null };
  }
);

export const getProductsPaginated = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const products = await productRepo.get_all_paginated(
      user.businessId ?? "",
      page,
      pageSize
    );
    if (products.error) {
      return { data: null, error: products.error };
    }
    return { data: products.data, error: null };
  }
);

export const getOverviewProducts = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user, limit: number) => {
    const products = await productRepo.get_overview(
      user.businessId ?? "",
      limit
    );
    if (products.error) {
      return { data: null, error: products.error };
    }
    return { data: products.data, error: null };
  }
);

export const getProductById = createProtectedAction(
  PERMISSION.PRODUCT_VIEW,
  async (user, productId: string) => {
    if (!productId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const product = await productRepo.get_by_id(
      productId,
      user.businessId ?? ""
    );
    if (product.error) {
      return { data: null, error: product.error };
    }
    return { data: product.data, error: null };
  }
);

export const createProduct = createProtectedAction(
  PERMISSION.PRODUCT_CREATE,
  async (user, productData: Omit<InsertProduct, "businessId" | "id">) => {
    if (!productData.name?.trim() || !productData.sku?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const product: InsertProduct = {
      ...productData,
      businessId: user.businessId ?? "",
    };
    const res = await productRepo.create(product, user.id);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`products-${user.businessId}`, "max");
    revalidateTag("products", "max");
    return { data: res.data, error: null };
  }
);

export const updateProduct = createProtectedAction(
  PERMISSION.PRODUCT_UPDATE,
  async (
    user,
    {
      productId,
      updates,
    }: {
      productId: string;
      updates: Partial<Omit<InsertProduct, "id" | "businessId">>;
    }
  ) => {
    if (!productId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const updatedProduct = await productRepo.update(
      productId,
      user.businessId ?? "",
      user.id,
      updates
    );
    if (updatedProduct.error) {
      return { data: null, error: updatedProduct.error };
    }
    revalidateTag(`products-${user.businessId}`, "max");
    revalidateTag(`product-${productId}`, "max");
    return { data: updatedProduct.data, error: null };
  }
);

export const deleteProduct = createProtectedAction(
  PERMISSION.PRODUCT_DELETE,
  async (user, productId: string) => {
    if (!productId?.trim()) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const res = await productRepo.remove(
      productId,
      user.businessId ?? "",
      user.id
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`products-${user.businessId}`, "max");
    revalidateTag(`product-${productId}`, "max");
    return { data: { success: true }, error: null };
  }
);

export const createManyProducts = createProtectedAction(
  PERMISSION.PRODUCT_CREATE,
  async (user, productsData: Omit<InsertProduct, "businessId" | "id">[]) => {
    if (!productsData?.length) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }
    const products: InsertProduct[] = productsData.map((product) => ({
      ...product,
      businessId: user.businessId ?? "",
    }));
    const createdProducts = await productRepo.create_many(products);
    if (createdProducts.error) {
      return { data: null, error: createdProducts.error };
    }
    revalidateTag(`products-${user.businessId}`, "max");
    revalidateTag("products", "max");
    return { data: createdProducts.data, error: null };
  }
);

export const getProductsForStore = async ({
  businessId,
  filters,
  featured,
  isPublished = true,
}: {
  businessId: string;
  filters: StoreProductFilters;
  featured?: boolean;
  isPublished?: boolean;
}) => {
  const result = await productRepo.get_products_for_store(
    businessId,
    filters,
    featured,
    isPublished
  );
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};

export const getProductByIdForStore = async (
  businessId: string,
  productId: string
) => {
  const result = await productRepo.get_product_by_id_for_store(
    businessId,
    productId
  );
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};

export const getCategoriesForStore = async (businessId: string) => {
  const result = await productRepo.get_categories_for_store({ businessId });
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};

export const searchProductsGlobally = async (
  query: string,
  limit: number = 5
) => {
  const result = await productRepo.search_products_globally(query, limit);
  if (result.error) {
    return { data: null, error: result.error };
  }
  return { data: result.data, error: null };
};
