import type { ErrorCode } from "./constants/errors";

export type ServiceResponse<T> = {
  data: T | null;
  error: ErrorCode | null;
};
