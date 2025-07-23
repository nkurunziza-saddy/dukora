import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import {
  transactionsTable,
  warehouseItemsTable,
  auditLogsTable,
  productsTable,
  productSuppliersTable,
  usersTable,
} from "@/lib/schema";
import {
  InsertTransaction,
  TransactionType,
  InsertAuditLog,
  InsertProductSupplier,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { create as createWarehouseItem } from "@/server/repos/warehouse-item-repo";
import { cache } from "react";

export const get_all = cache(async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transactions = await db
      .select({
        type: transactionsTable.type,
        quantity: transactionsTable.quantity,
        reference: transactionsTable.reference,
        note: transactionsTable.note,
        createdAt: transactionsTable.createdAt,
        product: productsTable.name,
        createdBy: usersTable.name,
      })
      .from(transactionsTable)
      .where(eq(transactionsTable.businessId, businessId))
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId)
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy))
      .orderBy(desc(transactionsTable.createdAt));

    return { data: transactions, error: null };
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
});

export const get_all_cached = unstable_cache(
  async (businessId: string) => {
    return get_all(businessId);
  },
  ["transactions"],
  {
    tags: ["transactions"],
    revalidate: 300,
  }
);

export const get_paginated = cache(
  async (businessId: string, page = 1, limit = 50) => {
    if (!businessId) {
      return { data: null, error: ErrorCode.MISSING_INPUT, total: 0 };
    }

    try {
      const offset = (page - 1) * limit;

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(transactionsTable)
        .where(eq(transactionsTable.businessId, businessId));

      const transactions = await db.query.transactionsTable.findMany({
        where: eq(transactionsTable.businessId, businessId),
        orderBy: desc(transactionsTable.createdAt),
        limit,
        offset,
        with: {
          product: true,
          createdByUser: true,
        },
      });

      return {
        data: transactions,
        error: null,
        total: totalResult.count,
        page,
        limit,
        totalPages: Math.ceil(totalResult.count / limit),
      };
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      return { data: null, error: ErrorCode.FAILED_REQUEST, total: 0 };
    }
  }
);

export async function get_by_time_interval(
  businessId: string,
  dateFrom: Date,
  dateTo: Date
) {
  try {
    const result = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          gte(transactionsTable.createdAt, dateFrom),
          lte(transactionsTable.createdAt, dateTo)
        )
      )
      .innerJoin(
        productsTable,
        eq(transactionsTable.productId, productsTable.id)
      );
    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
export async function get_time_interval_with_with(
  businessId: string,
  dateFrom: Date,
  dateTo: Date
) {
  try {
    const result = await db
      .select({
        type: transactionsTable.type,
        quantity: transactionsTable.quantity,
        reference: transactionsTable.reference,
        note: transactionsTable.note,
        createdAt: transactionsTable.createdAt,
        product: productsTable.name,
        createdBy: usersTable.name,
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          gte(transactionsTable.createdAt, dateFrom),
          lte(transactionsTable.createdAt, dateTo)
        )
      )
      .innerJoin(
        productsTable,
        eq(productsTable.id, transactionsTable.productId)
      )
      .innerJoin(usersTable, eq(usersTable.id, transactionsTable.createdBy))
      .orderBy(desc(transactionsTable.createdAt));

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_by_id(transactionId: string, businessId: string) {
  if (!transactionId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transaction = await db.query.transactionsTable.findFirst({
      where: and(
        eq(transactionsTable.id, transactionId),
        eq(transactionsTable.businessId, businessId)
      ),
      with: {
        product: true,
        warehouse: true,
        warehouseItem: true,
      },
    });

    if (!transaction) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: transaction, error: null };
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create(transaction: InsertTransaction) {
  if (
    !transaction.productId ||
    !transaction.businessId ||
    !transaction.warehouseItemId
  ) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [newTransaction] = await tx
        .insert(transactionsTable)
        .values(transaction)
        .returning();

      const stockChange =
        transaction.type === "SALE" || transaction.type === "DAMAGE"
          ? -Math.abs(transaction.quantity)
          : Math.abs(transaction.quantity);

      const [updatedWarehouseItem] = await tx
        .update(warehouseItemsTable)
        .set({
          quantity: sql`${warehouseItemsTable.quantity} + ${stockChange}`,
          lastUpdated: new Date(),
        })
        .where(eq(warehouseItemsTable.id, transaction.warehouseItemId))
        .returning();

      const auditData: InsertAuditLog = {
        businessId: transaction.businessId,
        model: "warehouseItem",
        recordId: updatedWarehouseItem.id,
        action: "update-warehouse-item",
        changes: JSON.stringify(updatedWarehouseItem),
        performedBy: transaction.createdBy,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return newTransaction;
    });

    revalidatePath("/transactions");
    revalidatePath("/sales");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create_with_warehouse_item(
  transaction: Omit<InsertTransaction, "warehouseItemId">
) {
  if (!transaction.productId || !transaction.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  console.log({ transaction });

  try {
    const result = await db.transaction(async (tx) => {
      const warehouseItemData = {
        productId: transaction.productId,
        warehouseId: transaction.warehouseId,
        quantity: transaction.quantity,
        lastUpdated: new Date(),
      };
      const existingWarehouseItem =
        await tx.query.warehouseItemsTable.findFirst({
          where: and(
            eq(warehouseItemsTable.productId, transaction.productId),
            eq(warehouseItemsTable.warehouseId, transaction.warehouseId)
          ),
        });
      let warehouseItem;
      if (existingWarehouseItem) {
        const updatedWarehouseItem = await tx
          .update(warehouseItemsTable)
          .set({
            quantity: sql`${warehouseItemsTable.quantity} + ${transaction.quantity}`,
            lastUpdated: new Date(),
          })
          .where(eq(warehouseItemsTable.id, existingWarehouseItem.id))
          .returning();
        warehouseItem = updatedWarehouseItem[0];
      } else {
        const newWarehouseItem = await createWarehouseItem(
          transaction.businessId,
          transaction.createdBy,
          warehouseItemData
        );
        if (newWarehouseItem.error) {
          return { data: null, error: newWarehouseItem.error };
        }
        warehouseItem = newWarehouseItem.data;
      }

      const [newTransaction] = await tx
        .insert(transactionsTable)
        .values({
          ...transaction,
          warehouseItemId: warehouseItem.id ?? "",
        })
        .returning();
      const productSupplierData: InsertProductSupplier = {
        productId: transaction.productId,
        supplierId: transaction.supplierId ?? "",
        businessId: transaction.businessId,
        note: transaction.note,
        supplierProductCode: warehouseItem.id ?? "",
      };
      await tx.insert(productSuppliersTable).values(productSupplierData);

      return newTransaction;
    });

    revalidatePath("/", "layout");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_by_type(businessId: string, type: TransactionType) {
  if (!businessId || !type) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.businessId, businessId),
          eq(transactionsTable.type, type)
        )
      )
      .orderBy(desc(transactionsTable.createdAt));

    return { data: transactions, error: null };
  } catch (error) {
    console.error("Failed to fetch transactions by type:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
