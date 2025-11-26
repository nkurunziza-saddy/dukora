"use server";

import { revalidateTag } from "next/cache";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as authRepo from "@/server/repos/auth-repo";

export const deleteAccount = createProtectedAction(
  PERMISSION.USER_DELETE,
  async (user, _input) => {
    const result = await authRepo.delete_account();
    if (result.error) {
      return { data: null, error: result.error };
    }

    revalidateTag(`user-${user.id}`, "max");
    revalidateTag("user-session", "max");

    return { data: result.data, error: null };
  }
);
