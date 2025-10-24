import { desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { auditLogsTable, interBusinessPaymentsTable } from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertInterBusinessPayment,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = cache(async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const payments = await db
      .select()
      .from(interBusinessPaymentsTable)
      .where(eq(interBusinessPaymentsTable.payerBusinessId, businessId))
      .orderBy(desc(interBusinessPaymentsTable.createdAt));
    return { data: payments, error: null };
  } catch (error) {
    console.error("Failed to get inter-business payments for business:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
});

export const get_all_paginated = cache(
  async (businessId: string, page: number, pageSize: number) => {
    if (!businessId) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    try {
      const offset = (page - 1) * pageSize;
      const payments = await db
        .select()
        .from(interBusinessPaymentsTable)
        .where(eq(interBusinessPaymentsTable.payerBusinessId, businessId))
        .orderBy(desc(interBusinessPaymentsTable.createdAt))
        .limit(pageSize)
        .offset(offset);
      return {
        data: { payments, totalCount: payments.length || 0 },
        error: null,
      };
    } catch (error) {
      console.error(
        "Failed to get inter-business payments for business:",
        error
      );
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }
  }
);

export async function get_by_id(paymentId: string) {
  if (!paymentId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const payment = await db.query.interBusinessPaymentsTable.findFirst({
      where: eq(interBusinessPaymentsTable.id, paymentId),
    });
    if (!payment) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }
    return { data: payment, error: null };
  } catch (error) {
    console.error("Failed to get inter-business payment by ID:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create(
  payment: InsertInterBusinessPayment,
  userId: string
) {
  if (!payment || !userId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const [newPayment] = await db
      .insert(interBusinessPaymentsTable)
      .values(payment)
      .returning();

    const auditData: InsertAuditLog = {
      businessId: payment.payerBusinessId,
      model: "interBusinessPayment",
      recordId: newPayment.id,
      action: "create-inter-business-payment",
      changes: JSON.stringify(payment),
      performedBy: userId,
      performedAt: new Date(),
    };

    await db.insert(auditLogsTable).values(auditData);

    return { data: newPayment, error: null };
  } catch (error) {
    console.error("Failed to create inter-business payment:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update_status(
  paymentId: string,
  status: string,
  userId: string
) {
  if (!paymentId || !status || !userId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  try {
    const [updatedPayment] = await db
      .update(interBusinessPaymentsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(interBusinessPaymentsTable.id, paymentId))
      .returning();

    if (!updatedPayment) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    const auditData: InsertAuditLog = {
      businessId: updatedPayment.payerBusinessId,
      model: "interBusinessPayment",
      recordId: updatedPayment.id,
      action: "update-inter-business-payment-status",
      changes: JSON.stringify({ status }),
      performedBy: userId,
      performedAt: new Date(),
    };

    await db.insert(auditLogsTable).values(auditData);

    return { data: updatedPayment, error: null };
  } catch (error) {
    console.error("Failed to update inter-business payment status:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
