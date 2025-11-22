"use server";

import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as authRepo from "@/server/repos/auth-repo";

export const getSecurityInfo = createProtectedAction(
  Permission.USER_VIEW,
  async (user, _input) => {
    const result = await authRepo.get_security_info(user.id);
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

export const getUserSessions = createProtectedAction(
  Permission.USER_VIEW,
  async (user, _input) => {
    const result = await authRepo.get_user_sessions(user.id);
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);
