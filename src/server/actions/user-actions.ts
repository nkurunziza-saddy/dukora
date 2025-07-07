"use server";

import type { InsertUser, UserRole } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidatePath } from "next/cache";
import { createProtectedAction } from "@/server/helpers/action-factory";
import {
  create as createUserRepo,
  get_by_id as getUserByIdRepo,
  update as updateUserRepo,
  get_all_cached as getAllUsersRepo,
  remove as removeUserRepo,
  toggle_active as toggleActiveRepo,
} from "../repos/user-repo";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const getUsers = createProtectedAction(
  Permission.USER_VIEW,
  async (user) => {
    const users = await getAllUsersRepo(user.businessId!);
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
    const result = await getUserByIdRepo(userId, user.businessId!);
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
    const newUser = await createUserRepo({
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
    const updatedUser = await updateUserRepo(
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
    const deletedUser = await removeUserRepo(userId, user.businessId!);
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
    const updatedUser = await toggleActiveRepo(userId, user.businessId!);
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
    const updatedUser = await updateUserRepo(
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
