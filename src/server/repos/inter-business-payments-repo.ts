import { db } from "@/lib/db";
import { interBusinessPaymentsTable, auditLogsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";
import type {
  InsertAuditLog,
  InsertInterBusinessPayment,
} from "@/lib/schema/schema-types";

export async function createInterBusinessPayment(
  payment: InsertInterBusinessPayment,
  userId: string
) {
  try {
    const [newPayment] = await db
      .insert(interBusinessPaymentsTable)
      .values(payment)
      .returning();

    const auditData: InsertAuditLog = {
      businessId: payment.payerBusinessId, // Or receiverBusinessId
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

export async function updateInterBusinessPaymentStatus(
  paymentId: string,
  status: string,
  userId: string
) {
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
      businessId: updatedPayment.payerBusinessId, // Or receiverBusinessId
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

export async function getInterBusinessPaymentById(paymentId: string) {
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

export async function getInterBusinessPaymentsForBusiness(businessId: string) {
  try {
    const payments = await db.query.interBusinessPaymentsTable.findMany({
      where: eq(interBusinessPaymentsTable.payerBusinessId, businessId),
    });
    return { data: payments, error: null };
  } catch (error) {
    console.error("Failed to get inter-business payments for business:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
