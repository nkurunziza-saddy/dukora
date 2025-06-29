import { db } from "@/lib/db";
import { transactionsTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";
import { eq } from "drizzle-orm";

export async function getTransactions(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const transactions = await db.query.transactionsTable.findMany({
      where: eq(transactionsTable.businessId, businessId),
      with: {
        createdByUser: true,
      },
    });
    return { data: transactions, error: null };
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getAuditLogs(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const auditLogs = await db.query.auditLogsTable.findMany({
      where: eq(transactionsTable.businessId, businessId),
      with: {
        performedBy: true,
      },
    });
    return { data: auditLogs, error: null };
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
