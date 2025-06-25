import { eq, desc, and, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { transactionsTable, warehouseItemsTable } from "@/lib/schema";
import type {
  InsertTransaction,
  TransactionType,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function getAll(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transactions = await db.query.transactionsTable.findMany({
      where: eq(transactionsTable.businessId, businessId),
      orderBy: desc(transactionsTable.createdAt),
      with: {
        product: true,
        createdByUser: true,
      },
    });

    return { data: transactions, error: null };
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getById(transactionId: string, businessId: string) {
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

      await tx
        .update(warehouseItemsTable)
        .set({
          quantity: sql`${warehouseItemsTable.quantity} + ${stockChange}`,
          lastUpdated: new Date(),
        })
        .where(eq(warehouseItemsTable.id, transaction.warehouseItemId));

      return newTransaction;
    });

    revalidateTag(`transactions-${transaction.businessId}`);
    revalidateTag(`warehouse-items-${transaction.businessId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getByType(businessId: string, type: TransactionType) {
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
