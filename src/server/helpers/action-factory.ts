import { type SessionUSer } from "@/lib/auth";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { Permission } from "@/server/constants/permissions";
import { roleHasPermission } from "@/server/helpers/role-permissions";
import { ErrorCode } from "@/server/constants/errors";

type ServiceResponse<T> = {
  data: T | null;
  error: ErrorCode | null;
};

export function createProtectedAction<TInput, TOutput>(
  permission: Permission,
  handler: (
    user: SessionUSer,
    input: TInput
  ) => Promise<ServiceResponse<TOutput>>
) {
  return async (input: TInput): Promise<ServiceResponse<TOutput>> => {
    const session = await getCurrentSession();
    if (!session || !roleHasPermission(session.user.role!, permission)) {
      return { data: null, error: ErrorCode.UNAUTHORIZED };
    }

    try {
      return await handler(session.user, input);
    } catch (error) {
      console.error(`Action failed for permission ${permission}:`, error);
      if (
        error instanceof Error &&
        Object.values(ErrorCode).includes(error.message as ErrorCode)
      ) {
        return { data: null, error: error.message as ErrorCode };
      }
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }
  };
}
export function createPublicAction<TInput, TOutput>(
  handler: (
    input: TInput
  ) => Promise<ServiceResponse<TOutput>>
) {
  return async (input: TInput): Promise<ServiceResponse<TOutput>> => {
    try {
      return await handler(input);
    } catch (error) {
      if (
        error instanceof Error &&
        Object.values(ErrorCode).includes(error.message as ErrorCode)
      ) {
        return { data: null, error: error.message as ErrorCode };
      }
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }
  };
}
