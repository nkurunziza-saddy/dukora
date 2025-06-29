"use server";

import type { InsertProduct } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";

import {
  create as createProductRepo,
  getById as getProductByIdRepo,
  update as updateProductRepo,
  getAll as getAllProductsRepo,
  remove as removeProductRepo,
  createMany as createManyProductsRepo,
} from "../repos/product-repo";
import { getOverview as getOverviewRepo } from "@/server/repos/product-repo";

export async function getProducts() {
  const currentUser = await getUserIfHasPermission(Permission.PRODUCT_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const products = await getAllProductsRepo(currentUser.businessId!);
    if (products.error) {
      return { data: null, error: products.error };
    }
    return { data: products.data, error: null };
  } catch (error) {
    console.error("Error getting products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getOverviewProducts(limit: number) {
  const currentUser = await getUserIfHasPermission(Permission.PRODUCT_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const products = await getOverviewRepo(currentUser.businessId!, limit);
    if (products.error) {
      return { data: null, error: products.error };
    }
    return { data: products.data, error: null };
  } catch (error) {
    console.error("Error getting products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getProductById(productId: string) {
  const currentUser = await getUserIfHasPermission(Permission.PRODUCT_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!productId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const product = await getProductByIdRepo(
      productId,
      currentUser.businessId!
    );

    if (product.error) {
      return { data: null, error: product.error };
    }

    return { data: product.data, error: null };
  } catch (error) {
    console.error("Error getting product:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createProduct(
  productData: Omit<InsertProduct, "businessId" | "id">
) {
  const currentUser = await getUserIfHasPermission(Permission.PRODUCT_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!productData.name?.trim() || !productData.sku?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const product: InsertProduct = {
      ...productData,
      businessId: currentUser.businessId!,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const { data: resData, error: resError } = await createProductRepo(
      product,
      currentUser.id
    );
    if (resError) {
      return { data: null, error: resError };
    }

    revalidateTag(`products-${currentUser.businessId!}`);

    return { data: resData, error: null };
  } catch (error) {
    console.error("Error creating product:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function updateProduct(
  productId: string,
  updates: Partial<Omit<InsertProduct, "id" | "businessId">>
) {
  const currentUser = await getUserIfHasPermission(Permission.PRODUCT_UPDATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!productId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const existingProduct = await getProductByIdRepo(
    productId,
    currentUser.businessId!
  );

  if (!existingProduct) {
    return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
  }

  try {
    const updatedProduct = await updateProductRepo(
      productId,
      currentUser.businessId!,
      currentUser.id,
      updates
    );
    if (updatedProduct.error) {
      return { data: null, error: updatedProduct.error };
    }

    revalidateTag(`products-${currentUser.businessId!}`);
    revalidateTag(`product-${productId}`);

    return { data: updatedProduct.data, error: null };
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteProduct(productId: string) {
  const currentUser = await getUserIfHasPermission(Permission.PRODUCT_DELETE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!productId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    await removeProductRepo(productId, currentUser.businessId!, currentUser.id);

    revalidateTag(`products-${currentUser.businessId!}`);
    revalidateTag(`product-${productId}`);

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createManyProducts(
  productsData: Omit<InsertProduct, "businessId" | "id">[]
) {
  const currentUser = await getUserIfHasPermission(Permission.PRODUCT_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!productsData?.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const products: InsertProduct[] = productsData.map((product, index) => ({
      ...product,
      businessId: currentUser.businessId!,
      id: `prod-${Date.now()}-${index}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    }));

    const createdProducts = await createManyProductsRepo(products);

    revalidateTag(`products-${currentUser.businessId!}`);

    return { data: createdProducts, error: null };
  } catch (error) {
    console.error("Error creating products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
