"use server";

import type { InsertUser, UserRole } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import {
  create as createUserRepo,
  getById as getUserByIdRepo,
  update as updateUserRepo,
  getAll as getAllUsersRepo,
  remove as removeUserRepo,
  toggleActive as toggleActiveRepo,
} from "../repos/user-repo";

export async function getUsers() {
  const currentUser = await getUserIfHasPermission(Permission.USER_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const users = await getAllUsersRepo(currentUser.businessId!);
    if (users.error) {
      return { data: null, error: users.error };
    }
    return { data: users.data, error: null };
  } catch (error) {
    console.error("Error getting users:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getUserById(userId: string) {
  const currentUser = await getUserIfHasPermission(Permission.USER_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!userId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const user = await getUserByIdRepo(userId, currentUser.businessId!);
    if (user.error) {
      return { data: null, error: user.error };
    }
    return { data: user.data, error: null };
  } catch (error) {
    console.error("Error getting user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createUser(
  userData: Omit<InsertUser, "id" | "businessId" | "createdAt" | "updatedAt">
) {
  const currentUser = await getUserIfHasPermission(Permission.USER_CREATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!userData.email?.trim() || !userData.name?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const newUser = await createUserRepo({
      ...userData,
      businessId: currentUser.businessId!,
    });

    if (newUser.error) {
      return { data: null, error: newUser.error };
    }

    revalidateTag(`users-${currentUser.businessId!}`);
    return { data: newUser.data, error: null };
  } catch (error) {
    console.error("Error creating user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function updateUser(
  userId: string,
  userData: Partial<InsertUser>
) {
  const currentUser = await getUserIfHasPermission(Permission.USER_UPDATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!userId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const updatedUser = await updateUserRepo(
      userId,
      userData,
      currentUser.businessId!
    );
    if (updatedUser.error) {
      return { data: null, error: updatedUser.error };
    }

    revalidateTag(`users-${currentUser.businessId!}`);
    return { data: updatedUser.data, error: null };
  } catch (error) {
    console.error("Error updating user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteUser(userId: string) {
  const currentUser = await getUserIfHasPermission(Permission.USER_DELETE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!userId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  if (userId === currentUser.id) {
    return { data: null, error: ErrorCode.CANNOT_DELETE_SELF };
  }

  try {
    const deletedUser = await removeUserRepo(userId, currentUser.businessId!);
    if (deletedUser.error) {
      return { data: null, error: deletedUser.error };
    }

    revalidateTag(`users-${currentUser.businessId!}`);
    return { data: deletedUser.data, error: null };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function toggleUserStatus(userId: string) {
  const currentUser = await getUserIfHasPermission(Permission.USER_UPDATE);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!userId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  if (userId === currentUser.id) {
    return { data: null, error: ErrorCode.CANNOT_DEACTIVATE_SELF };
  }

  try {
    const updatedUser = await toggleActiveRepo(userId, currentUser.businessId!);
    if (updatedUser.error) {
      return { data: null, error: updatedUser.error };
    }

    revalidateTag(`users-${currentUser.businessId!}`);
    return { data: updatedUser.data, error: null };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function assignRole(userId: string, role: UserRole) {
  const currentUser = await getUserIfHasPermission(
    Permission.USER_ASSIGN_ROLES
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!userId?.trim() || !role?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const updatedUser = await updateUserRepo(
      userId,
      { role },
      currentUser.businessId!
    );
    if (updatedUser.error) {
      return { data: null, error: updatedUser.error };
    }

    revalidateTag(`users-${currentUser.businessId!}`);
    return { data: updatedUser.data, error: null };
  } catch (error) {
    console.error("Error assigning role:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
