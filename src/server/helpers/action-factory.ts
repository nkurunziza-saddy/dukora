import type { SessionUser } from "@/lib/auth";
import type { UserRole } from "@/lib/schema/schema-types";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { ERROR_CODE } from "@/server/constants/errors";
import type { PERMISSION } from "@/server/constants/permissions";
import { roleHasPermission } from "@/server/helpers/role-permissions";

type ServiceResponse<T> = {
  data: T | null;
  error: ERROR_CODE | null;
};

export function createProtectedAction<TInput, TOutput>(
  permission: PERMISSION,
  handler: (
    user: SessionUser,
    input: TInput
  ) => Promise<ServiceResponse<TOutput>>
) {
  return async (input: TInput): Promise<ServiceResponse<TOutput>> => {
    const session = await getCurrentSession();
    if (
      !session ||
      !roleHasPermission(session.user.role as UserRole, permission)
    ) {
      return { data: null, error: ERROR_CODE.UNAUTHORIZED };
    }

    try {
      return await handler(session.user, input);
    } catch (error) {
      console.error(`Action failed for permission ${permission}:`, error);
      if (
        error instanceof Error &&
        Object.values(ERROR_CODE).includes(error.message as ERROR_CODE)
      ) {
        return { data: null, error: error.message as ERROR_CODE };
      }
      return { data: null, error: ERROR_CODE.FAILED_REQUEST };
    }
  };
}
export function createPublicAction<TInput, TOutput>(
  handler: (input: TInput) => Promise<ServiceResponse<TOutput>>
) {
  return async (input: TInput): Promise<ServiceResponse<TOutput>> => {
    try {
      return await handler(input);
    } catch (error) {
      if (
        error instanceof Error &&
        Object.values(ERROR_CODE).includes(error.message as ERROR_CODE)
      ) {
        return { data: null, error: error.message as ERROR_CODE };
      }
      return { data: null, error: ERROR_CODE.FAILED_REQUEST };
    }
  };
}
