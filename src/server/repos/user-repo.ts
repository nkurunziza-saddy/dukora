"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import type { InsertUser } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = cache(async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.businessId, businessId),
          isNull(usersTable.deletedAt),
        ),
      );
    return { data: users, error: null };
  } catch (error) {
    console.error("Failed to get users:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
});

export const get_all_cached = unstable_cache(
  async (businessId: string) => {
    return get_all(businessId);
  },
  ["users"],
  {
    revalidate: 300,
    tags: ["users"],
  },
);

export const get_by_id = cache(async (userId: string, businessId: string) => {
  if (!userId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const user = await db.query.usersTable.findFirst({
      where: and(
        eq(usersTable.id, userId),
        eq(usersTable.businessId, businessId),
        isNull(usersTable.deletedAt),
      ),
      with: {
        business: true,
        schedules: true,
        auditLogs: true,
        expenses: true,
        transactions: true,
      },
    });

    if (!user) {
      return { data: null, error: ErrorCode.USER_NOT_FOUND };
    }

    return { data: user, error: null };
  } catch (error) {
    console.error("Failed to get user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
});

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

    revalidatePath(`/`, "layout");
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

    revalidatePath(`/`, "layout");
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

    revalidatePath(`/`, "layout");
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

    revalidatePath(`/`, "layout");
    return { data: result[0], error: null };
  } catch (error) {
    console.error("Failed to toggle user status:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
