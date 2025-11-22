"use server";

import { revalidateTag } from "next/cache";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as authRepo from "@/server/repos/auth-repo";

export const revokeSession = createProtectedAction(
  Permission.USER_UPDATE,
  async (user, sessionToken: string) => {
    if (!sessionToken?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }

    const result = await authRepo.revoke_session(sessionToken);

    if (result.error) {
      return { data: null, error: result.error };
    }

    revalidateTag(`user-${user.id}`, "max");
    revalidateTag("user-session", "max");

    return { data: { success: true }, error: null };
  },
);

export const revokeAllOtherSessions = createProtectedAction(
  Permission.USER_UPDATE,
  async (user) => {
    const result = await authRepo.revoke_all_other_sessions();

    if (result.error) {
      return { data: null, error: result.error };
    }

    revalidateTag(`user-${user.id}`, "max");
    revalidateTag("user-session", "max");

    return { data: { success: true }, error: null };
  },
);
