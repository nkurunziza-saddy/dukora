"use server";

import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as authRepo from "@/server/repos/users/auth-repo";

export const getSecurityInfo = createProtectedAction(
  PERMISSION.USER_VIEW,
  async (user, _input) => {
    const result = await authRepo.get_security_info(user.id);
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  },
);

export const getUserSessions = createProtectedAction(
  PERMISSION.USER_VIEW,
  async (user, _input) => {
    const result = await authRepo.get_user_sessions(user.id);
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  },
);
