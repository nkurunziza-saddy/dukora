"use server";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import type { InsertUser } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { get_by_id } from "./user-query-repo";

export async function create(userData: Omit<InsertUser, "id">) {
  if (!userData.email || !userData.name || !userData.businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .insert(usersTable)
      .values({
        ...userData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  userId: string,
  userData: Partial<InsertUser>,
  businessId: string,
) {
  if (!userId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .update(usersTable)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(usersTable.id, userId),
          eq(usersTable.businessId, businessId),
          isNull(usersTable.deletedAt),
        ),
      )
      .returning();

    if (result.length === 0) {
      return { data: null, error: ErrorCode.USER_NOT_FOUND };
    }

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(userId: string, businessId: string) {
  if (!userId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .update(usersTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(usersTable.id, userId),
          eq(usersTable.businessId, businessId),
          isNull(usersTable.deletedAt),
        ),
      )
      .returning();

    if (result.length === 0) {
      return { data: null, error: ErrorCode.USER_NOT_FOUND };
    }

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function toggle_active(userId: string, businessId: string) {
  if (!userId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const currentUser = await get_by_id(userId, businessId);
    if (currentUser.error) {
      return currentUser;
    }

    const result = await db
      .update(usersTable)
      .set({
        isActive: !currentUser.data?.isActive,
        updatedAt: new Date(),
      })
      .where(
        and(eq(usersTable.id, userId), eq(usersTable.businessId, businessId)),
      )
      .returning();

    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to toggle user status:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
