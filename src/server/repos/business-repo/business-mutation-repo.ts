"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogsTable, businessesTable, usersTable } from "@/lib/schema";
import type { InsertAuditLog, InsertBusiness } from "@/lib/schema/schema-types";
import { ErrorCode } from "../../constants/errors";

export async function create(userId: string, business: InsertBusiness) {
  if (!business.name) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [newBusiness] = await tx
        .insert(businessesTable)
        .values(business)
        .returning();

      await tx
        .update(usersTable)
        .set({ businessId: newBusiness.id, role: "OWNER" })
        .where(eq(usersTable.id, userId));

      const auditData: InsertAuditLog = {
        businessId: newBusiness.id,
        model: "business",
        recordId: newBusiness.id,
        action: "create-business",
        changes: JSON.stringify(business),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return newBusiness;
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create business:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  businessId: string,
  userId: string,
  updates: Partial<InsertBusiness>,
) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [updatedBusiness] = await tx
        .update(businessesTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(businessesTable.id, businessId))
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "business",
        recordId: updatedBusiness.id,
        action: "update-business",
        changes: JSON.stringify(updates),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return updatedBusiness;
    });

    if (!result) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to update business:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(businessId: string, userId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const existingRecord = await db.query.businessesTable.findFirst({
      where: eq(businessesTable.id, businessId),
    });
    if (!existingRecord) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }
    const result = await db.transaction(async (tx) => {
      const [deletedBusiness] = await tx
        .delete(businessesTable)
        .where(eq(businessesTable.id, businessId))
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "business",
        recordId: businessId,
        action: "delete-business",
        changes: JSON.stringify(existingRecord),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return deletedBusiness;
    });

    if (!result) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to delete business:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create_many(businesses: InsertBusiness[]) {
  if (!businesses.length) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .insert(businessesTable)
      .values(businesses)
      .returning();

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create businesses:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
