"use server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { revalidateTag, unstable_cache } from "next/cache";
import { productSupplierTable } from "@/lib/schema";

export async function getProducts() {
  try {
    return await db
      .select()
      .from(productSupplierTable)
      .orderBy(productSupplierTable.createdAt);
  } catch (error) {
    console.error("Error getting products:", error);
    throw new Error("Failed to get products");
  }
}

export const getCachedProducts = unstable_cache(
  async () => getProducts(),
  ["products"],
  {
    revalidate: 300,
    tags: ["products"],
  }
);

export async function getProductById(productId: string) {
  try {
    const product = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, productId),
      with: {
        lendings: {
          orderBy: desc(lendingTable.createdAt),
          with: {
            student: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  } catch (error) {
    console.error("Error getting product:", error);
    throw new Error("Failed to get product");
  }
}

export const getCachedProductById = async (id: string) =>
  unstable_cache(() => getProductById(id), ["products", id], {
    revalidate: 300,
    tags: ["products", id],
  });

export async function createProduct(product: InsertProduct) {
  try {
    const [newProduct] = await db
      .insert(productsTable)
      .values(product)
      .returning();
    revalidateTag("products");
    return newProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
}
export async function updateProduct(product: InsertProduct) {
  try {
    const [updatedProduct] = await db
      .update(productsTable)
      .set(product)
      .where(eq(productsTable.id, product.id!))
      .returning();
    revalidateTag("products");
    return updatedProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
}

export async function updateProductStatus(
  productId: string,
  status: "available" | "unavailable"
) {
  try {
    const [updatedProduct] = await db
      .update(productsTable)
      .set({ status })
      .where(eq(productsTable.id, productId))
      .returning();
    revalidateTag("products");
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product status:", error);
    throw new Error("Failed to update product status");
  }
}

export async function deleteProduct(
  productId: string
): Promise<{ status: number; msg: string }> {
  try {
    if (!productId) {
      return { status: 400, msg: "Product ID is required." };
    }

    const existingLoan = await db.query.lendingTable.findFirst({
      where: eq(lendingTable.productId, productId),
    });
    if (existingLoan) {
      return {
        status: 403,
        msg: "Cannot delete product. It has an active or past loan record.",
      };
    }

    const result = await db
      .delete(productsTable)
      .where(eq(productsTable.id, productId));
    if (result.rowsAffected === 0) {
      return {
        status: 500,
        msg: "Failed to delete product. No rows affected.",
      };
    }

    revalidateTag("products");
    return { status: 204, msg: "Product deleted successfully." };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { status: 500, msg: "Failed to delete product." };
  }
}
