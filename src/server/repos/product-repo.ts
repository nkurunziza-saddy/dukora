import { eq, desc, and } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { productsTable } from "@/lib/schema";
import type { InsertProduct } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function getAll(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.businessId, businessId))
      .orderBy(desc(productsTable.createdAt));
    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const getAllCached = async (businessId: string) => {
  return unstable_cache(
    async () => await getAll(businessId),
    ["products", businessId],
    {
      revalidate: 300,
      tags: [`products-${businessId}`],
    }
  );
};

export async function getById(productId: string, businessId: string) {
  if (!productId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const product = await db.query.productsTable.findFirst({
      where: and(
        eq(productsTable.id, productId),
        eq(productsTable.businessId, businessId)
      ),
      with: {
        category: true,
        productVariants: true,
        // productSuppliers: true,
        // productPriceHistory: true,
        transactions: true,
        warehouseItems: {
          with: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
    }

    return { data: product, error: null };
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const getByIdCached = async (productId: string, businessId: string) =>
  unstable_cache(
    async () => await getById(productId, businessId),
    ["products", productId, businessId],
    {
      revalidate: 300,
      tags: [`products-${businessId}`, `product-${productId}`],
    }
  );

export async function create(product: InsertProduct) {
  if (!product.name || !product.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.insert(productsTable).values(product).returning();

    revalidateTag("products");
    revalidateTag(`products-${product.businessId}`);

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  productId: string,
  businessId: string,
  updates: Partial<InsertProduct>
) {
  if (!productId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db
      .update(productsTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(productsTable.id, productId),
          eq(productsTable.businessId, businessId)
        )
      )
      .returning();

    if (result.length === 0) {
      return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
    }

    revalidateTag(`products-${businessId}`);
    revalidateTag(`product-${productId}`);

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(productId: string, businessId: string) {
  if (!productId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .delete(productsTable)
      .where(
        and(
          eq(productsTable.id, productId),
          eq(productsTable.businessId, businessId)
        )
      )
      .returning();

    if (result.length === 0) {
      return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
    }

    revalidateTag(`products-${businessId}`);
    revalidateTag(`product-${productId}`);

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createMany(products: InsertProduct[]) {
  if (!products.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  const businessId = products[0]?.businessId;
  if (!businessId || !products.every((p) => p.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.insert(productsTable).values(products).returning();

    revalidateTag(`products-${businessId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
