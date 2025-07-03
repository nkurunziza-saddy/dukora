"use server";

import type { InsertProduct } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { createProtectedAction } from "@/server/helpers/action-factory";

import * as productRepo from "../repos/product-repo";
import { revalidatePath } from "next/cache";

export const getProducts = createProtectedAction(
  Permission.PRODUCT_VIEW,
  async (user) => {
    const products = await productRepo.getAll(user.businessId!);
    if (products.error) {
      return { data: null, error: products.error };
    }
    return { data: products.data, error: null };
  }
);

export const getOverviewProducts = createProtectedAction(
  Permission.PRODUCT_VIEW,
  async (user, limit: number) => {
    const products = await productRepo.getOverview(user.businessId!, limit);
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
    const product = await productRepo.getById(productId, user.businessId!);
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
    const res = await productRepo.create(product, user.id);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidatePath("/", "layout");
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
    const updatedProduct = await productRepo.update(
      productId,
      user.businessId!,
      user.id,
      updates
    );
    if (updatedProduct.error) {
      return { data: null, error: updatedProduct.error };
    }
    revalidatePath("/", "layout");
    return { data: updatedProduct.data, error: null };
  }
);

export const deleteProduct = createProtectedAction(
  Permission.PRODUCT_DELETE,
  async (user, productId: string) => {
    if (!productId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const res = await productRepo.remove(productId, user.businessId!, user.id);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidatePath("/", "layout");
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
    const createdProducts = await productRepo.createMany(products);
    if (createdProducts.error) {
      return { data: null, error: createdProducts.error };
    }
    revalidatePath("/", "layout");
    return { data: createdProducts.data, error: null };
  }
);
