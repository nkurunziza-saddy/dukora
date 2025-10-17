import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import {
  auditLogsTable,
  categoriesTable,
  productsTable,
  warehouseItemsTable,
  warehousesTable,
} from "@/lib/schema";
import type { InsertAuditLog, InsertProduct } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = cache(async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.businessId, businessId),
          isNull(productsTable.deletedAt),
        ),
      )
      .orderBy(desc(productsTable.createdAt));

    return { data: products, error: null };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
});

export const get_all_cached = unstable_cache(
  async (businessId: string) => {
    return get_all(businessId);
  },
  ["products"],
  {
    tags: ["products"],
    revalidate: 300,
  },
);

export const get_overview = cache(
  async (businessId: string, limit?: number) => {
    if (!businessId) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }

    try {
      const query = db
        .select()
        .from(productsTable)
        .where(
          and(
            eq(productsTable.businessId, businessId),
            isNull(productsTable.deletedAt),
          ),
        )
        .orderBy(desc(productsTable.createdAt))
        .innerJoin(
          warehouseItemsTable,
          eq(productsTable.id, warehouseItemsTable.productId),
        )
        .innerJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id),
        )
        .innerJoin(
          warehousesTable,
          eq(warehouseItemsTable.warehouseId, warehousesTable.id),
        );

      const products = await (limit ? query.limit(limit) : query);
      return { data: products, error: null };
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }
  },
);

export async function get_by_id(productId: string, businessId: string) {
  if (!productId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const product = await db.query.productsTable.findFirst({
      where: and(
        eq(productsTable.id, productId),
        eq(productsTable.businessId, businessId),
      ),
      with: {
        category: true,
        productVariants: true,
        transactions: true,
        productSuppliers: true,
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

export const get_by_id_cached = unstable_cache(
  async (productId: string, businessId: string) => {
    return get_by_id(productId, businessId);
  },
  ["products", "byId"],
  {
    tags: ["products"],
    revalidate: 300,
  },
);

export async function create(product: InsertProduct, userId: string) {
  if (!product.name || !product.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [newProduct] = await tx
        .insert(productsTable)
        .values(product)
        .returning();

      const auditData: InsertAuditLog = {
        businessId: product.businessId,
        model: "product",
        recordId: newProduct.id,
        action: "create-product",
        changes: JSON.stringify(product),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return newProduct;
    });

    revalidatePath("/", "layout");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  productId: string,
  businessId: string,
  userId: string,
  updates: Partial<InsertProduct>,
) {
  if (!productId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const result = await db.transaction(async (tx) => {
      const [updatedProduct] = await tx
        .update(productsTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(
            eq(productsTable.id, productId),
            eq(productsTable.businessId, businessId),
            isNull(productsTable.deletedAt),
          ),
        )
        .returning();

      if (!updatedProduct) return null;

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "product",
        recordId: updatedProduct.id,
        action: "update-product",
        changes: JSON.stringify(updates),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return updatedProduct;
    });

    if (!result) {
      return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
    }

    revalidatePath("/", "layout");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(
  productId: string,
  businessId: string,
  userId: string,
) {
  if (!productId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const existingRecord = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, productId),
    });
    if (!existingRecord) {
      return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
    }
    const result = await db.transaction(async (tx) => {
      const [deletedProduct] = await tx
        .update(productsTable)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(productsTable.id, productId),
            eq(productsTable.businessId, businessId),
          ),
        )
        .returning();

      if (!deletedProduct) return null;

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "product",
        recordId: productId,
        action: "delete-product",
        changes: JSON.stringify(existingRecord),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return deletedProduct;
    });

    if (!result) {
      return { data: null, error: ErrorCode.PRODUCT_NOT_FOUND };
    }
    revalidatePath("/", "layout");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create_many(products: InsertProduct[]) {
  if (!products.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  const businessId = products[0]?.businessId;
  if (!businessId || !products.every((p) => p.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.insert(productsTable).values(products).returning();

    revalidatePath("/", "layout");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create products:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
