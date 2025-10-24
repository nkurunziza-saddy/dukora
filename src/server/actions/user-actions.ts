"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import type { InsertUser, UserRole } from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as userRepo from "../repos/user-repo";

export const getUsers = createProtectedAction(
  Permission.USER_VIEW,
  async (user) => {
    const users = await userRepo.get_all_cached(user.businessId!);
    if (users.error) {
      return { data: null, error: users.error };
    }
    return { data: users.data, error: null };
  }
);

export const getUsersPaginated = createProtectedAction(
  Permission.USER_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    const users = await userRepo.get_all_paginated_cached(
      user.businessId!,
      page,
      pageSize
    );
    if (users.error) {
      return { data: null, error: users.error };
    }
    return { data: users.data, error: null };
  }
);

export const getUserById = createProtectedAction(
  Permission.USER_VIEW,
  async (user, userId: string) => {
    if (!userId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const result = await userRepo.get_by_id(userId, user.businessId!);
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

export const createUser = createProtectedAction(
  Permission.USER_CREATE,
  async (user, userData: Omit<InsertUser, "id" | "businessId">) => {
    if (!userData.email?.trim() || !userData.name?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const newUser = await userRepo.create({
      ...userData,
      businessId: user.businessId!,
    });
    if (newUser.error) {
      return { data: null, error: newUser.error };
    }
    revalidatePath("/dashboard/users");
    return { data: newUser.data, error: null };
  }
);

export const updateUser = createProtectedAction(
  Permission.USER_UPDATE,
  async (
    user,
    { userId, userData }: { userId: string; userData: Partial<InsertUser> }
  ) => {
    if (!userId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedUser = await userRepo.update(
      userId,
      userData,
      user.businessId!
    );
    if (updatedUser.error) {
      return { data: null, error: updatedUser.error };
    }
    revalidatePath("/dashboard/users");
    return { data: updatedUser.data, error: null };
  }
);

export const deleteUser = createProtectedAction(
  Permission.USER_DELETE,
  async (user, userId: string) => {
    if (!userId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    if (userId === user.id) {
      return { data: null, error: ErrorCode.CANNOT_DELETE_SELF };
    }
    const deletedUser = await userRepo.remove(userId, user.businessId!);
    if (deletedUser.error) {
      return { data: null, error: deletedUser.error };
    }
    revalidatePath("/dashboard/users");
    return { data: { success: true }, error: null };
  }
);

export const toggleUserStatus = createProtectedAction(
  Permission.USER_UPDATE,
  async (user, userId: string) => {
    if (!userId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    if (userId === user.id) {
      return { data: null, error: ErrorCode.CANNOT_DEACTIVATE_SELF };
    }
    const updatedUser = await userRepo.toggle_active(userId, user.businessId!);
    if (updatedUser.error) {
      return { data: null, error: updatedUser.error };
    }
    revalidatePath("/dashboard/users");
    return { data: updatedUser.data, error: null };
  }
);

export const assignRole = createProtectedAction(
  Permission.USER_ASSIGN_ROLES,
  async (user, { userId, role }: { userId: string; role: UserRole }) => {
    if (!userId?.trim() || !role?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedUser = await userRepo.update(
      userId,
      { role },
      user.businessId!
    );
    if (updatedUser.error) {
      return { data: null, error: updatedUser.error };
    }
    revalidatePath("/dashboard/users");
    return { data: updatedUser.data, error: null };
  }
);

export const changeUserPassword = createProtectedAction(
  Permission.USER_CREATE,
  async (user, { password }: { password: string }) => {
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, user.id),
    });

    if (!existingUser) {
      return { data: null, error: ErrorCode.USER_NOT_FOUND };
    }
    if (!existingUser.password) {
      return { data: null, error: ErrorCode.BAD_REQUEST };
    }
    const updateResult = await auth.api.changePassword({
      body: {
        newPassword: password,
        currentPassword: existingUser.password!,
        revokeOtherSessions: true,
      },
    });

    if (!updateResult.user) {
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }

    return { data: updateResult, error: null };
  }
);
