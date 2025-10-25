"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogsTable, interBusinessPaymentsTable } from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertInterBusinessPayment,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export async function create(
  payment: InsertInterBusinessPayment,
  userId: string,
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
  userId: string,
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
