"use server";

import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { ErrorCode } from "@/server/constants/errors";
import type { InsertUser } from "@/lib/schema/schema-types";
import { usersTable } from "@/lib/schema";

export async function getAll(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(
        and(eq(usersTable.businessId, businessId), isNull(usersTable.deletedAt))
      );
    return { data: users, error: null };
  } catch (error) {
    console.error("Failed to get users:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getById(userId: string, businessId: string) {
  if (!userId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, userId),
          eq(usersTable.businessId, businessId),
          isNull(usersTable.deletedAt)
        )
      )
      .limit(1);

    if (user.length === 0) {
      return { data: null, error: ErrorCode.USER_NOT_FOUND };
    }

    return { data: user[0], error: null };
  } catch (error) {
    console.error("Failed to get user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

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

    revalidateTag(`users-${userData.businessId}`);
    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  userId: string,
  userData: Partial<InsertUser>,
  businessId: string
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
          isNull(usersTable.deletedAt)
        )
      )
      .returning();

    if (result.length === 0) {
      return { data: null, error: ErrorCode.USER_NOT_FOUND };
    }

    revalidateTag(`users-${businessId}`);
    revalidateTag(`user-${userId}`);
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
          isNull(usersTable.deletedAt)
        )
      )
      .returning();

    if (result.length === 0) {
      return { data: null, error: ErrorCode.USER_NOT_FOUND };
    }

    revalidateTag(`users-${businessId}`);
    revalidateTag(`user-${userId}`);
    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function toggleActive(userId: string, businessId: string) {
  if (!userId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const currentUser = await getById(userId, businessId);
    if (currentUser.error) {
      return currentUser;
    }

    const result = await db
      .update(usersTable)
      .set({
        isActive: !currentUser.data!.isActive,
        updatedAt: new Date(),
      })
      .where(
        and(eq(usersTable.id, userId), eq(usersTable.businessId, businessId))
      )
      .returning();

    revalidateTag(`users-${businessId}`);
    revalidateTag(`user-${userId}`);
    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to toggle user status:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
