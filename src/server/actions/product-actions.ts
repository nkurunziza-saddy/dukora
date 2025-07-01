"use server";

import type { InsertProduct } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import { createProtectedAction } from "@/server/helpers/action-factory";

import {
  create as createProductRepo,
  getById as getProductByIdRepo,
  update as updateProductRepo,
  getAll as getAllProductsRepo,
  remove as removeProductRepo,
  createMany as createManyProductsRepo,
  getOverview as getOverviewRepo,
} from "../repos/product-repo";

export const getProducts = createProtectedAction(
  Permission.PRODUCT_VIEW,
  async (user) => {
    const products = await getAllProductsRepo(user.businessId!);
    if (products.error) {
      return { data: null, error: products.error };
    }
    return { data: products.data, error: null };
  }
);

export const getOverviewProducts = createProtectedAction(
  Permission.PRODUCT_VIEW,
  async (user, limit: number) => {
    const products = await getOverviewRepo(user.businessId!, limit);
    if (products.error) {
      return { data: null, error: products.error };
    }
    return { data: products.data, error: null };
  }
);

export const getProductById = createProtectedAction(
  Permission.PRODUCT_VIEW,
  async (user, productId: string) => {
    if (!productId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const product = await getProductByIdRepo(productId, user.businessId!);
    if (product.error) {
      return { data: null, error: product.error };
    }
    return { data: product.data, error: null };
  }
);

export const createProduct = createProtectedAction(
  Permission.PRODUCT_CREATE,
  async (user, productData: Omit<InsertProduct, "businessId" | "id">) => {
    if (!productData.name?.trim() || !productData.sku?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const product: InsertProduct = {
      ...productData,
      businessId: user.businessId!,
    };
    const res = await createProductRepo(product, user.id);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`products-${user.businessId!}`);
    return { data: res.data, error: null };
  }
);

export const updateProduct = createProtectedAction(
  Permission.PRODUCT_UPDATE,
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
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedProduct = await updateProductRepo(
      productId,
      user.businessId!,
      user.id,
      updates
    );
    if (updatedProduct.error) {
      return { data: null, error: updatedProduct.error };
    }
    revalidateTag(`products-${user.businessId!}`);
    revalidateTag(`product-${productId}`);
    return { data: updatedProduct.data, error: null };
  }
);

export const deleteProduct = createProtectedAction(
  Permission.PRODUCT_DELETE,
  async (user, productId: string) => {
    if (!productId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const res = await removeProductRepo(productId, user.businessId!, user.id);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`products-${user.businessId!}`);
    revalidateTag(`product-${productId}`);
    return { data: { success: true }, error: null };
  }
);

export const createManyProducts = createProtectedAction(
  Permission.PRODUCT_CREATE,
  async (user, productsData: Omit<InsertProduct, "businessId" | "id">[]) => {
    if (!productsData?.length) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const products: InsertProduct[] = productsData.map((product) => ({
      ...product,
      businessId: user.businessId!,
    }));
    const createdProducts = await createManyProductsRepo(products);
    if (createdProducts.error) {
      return { data: null, error: createdProducts.error };
    }
    revalidateTag(`products-${user.businessId!}`);
    return { data: createdProducts.data, error: null };
  }
);
