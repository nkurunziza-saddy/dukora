"use server";

import { revalidateTag } from "next/cache";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as authRepo from "@/server/repos/auth-repo";

export const changePassword = createProtectedAction(
  Permission.USER_UPDATE,
  async (
    user,
    {
      currentPassword,
      newPassword,
      revokeOtherSessions = false,
    }: {
      currentPassword: string;
      newPassword: string;
      revokeOtherSessions?: boolean;
    }
  ) => {
    if (!currentPassword?.trim() || !newPassword?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }

    if (newPassword.length < 8) {
      return { data: null, error: ErrorCode.INVALID_INPUT };
    }

    const result = await authRepo.change_password(
      currentPassword,
      newPassword,
      revokeOtherSessions
    );

    if (result.error) {
      return { data: null, error: result.error };
    }

    revalidateTag(`user-${user.id}`, "max");
    revalidateTag("user-session", "max");

    return { data: { success: true }, error: null };
  }
);

export const setPassword = createProtectedAction(
  Permission.USER_UPDATE,
  async (user, newPassword: string) => {
    if (!newPassword?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }

    if (newPassword.length < 8) {
      return { data: null, error: ErrorCode.INVALID_INPUT };
    }

    const result = await authRepo.set_password(newPassword);

    if (result.error) {
      return { data: null, error: result.error };
    }

    revalidateTag(`user-${user.id}`, "max");
    revalidateTag("user-session", "max");

    return { data: { success: true }, error: null };
  }
);
