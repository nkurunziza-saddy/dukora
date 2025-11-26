import type { ERROR_CODE } from "./constants/errors";

export type ServiceResponse<T> = {
  data: T | null;
  error: ERROR_CODE | null;
};
