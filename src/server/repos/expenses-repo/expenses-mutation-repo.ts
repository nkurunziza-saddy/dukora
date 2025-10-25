"use server";

import { db } from "@/lib/db";
import { auditLogsTable, expensesTable } from "@/lib/schema";
import type { InsertAuditLog, InsertExpense } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function create(expense: InsertExpense) {
  if (!expense.amount || !expense.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [newExpense] = await tx
        .insert(expensesTable)
        .values(expense)
        .returning();

      const auditData: InsertAuditLog = {
        businessId: expense.businessId,
        model: "expense",
        recordId: newExpense.id,
        action: "create-expense",
        changes: JSON.stringify(newExpense),
        performedBy: expense.createdBy,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);

      return newExpense;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create expense:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
