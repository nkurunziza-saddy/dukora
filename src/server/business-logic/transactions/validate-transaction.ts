import type {
  InsertTransaction,
  TransactionType,
} from "@/lib/schema/schema.types";
import { ERROR_CODE } from "@/server/constants/errors";

export type ValidationResult = {
  valid: boolean;
  error: ERROR_CODE | null;
};

export type TransactionInput = Omit<
  InsertTransaction,
  "businessId" | "id" | "createdBy"
>;

export function validateTransactionData(
  data: TransactionInput,
): ValidationResult {
  if (!data.productId?.trim()) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  if (!data.warehouseItemId?.trim()) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  if (!data.type) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  if (typeof data.quantity !== "number") {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  if (data.quantity <= 0) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  return { valid: true, error: null };
}

export function validateTransactionDataWithoutWarehouse(
  data: Omit<TransactionInput, "warehouseItemId">,
): ValidationResult {
  if (!data.productId?.trim()) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  if (!data.type) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  if (typeof data.quantity !== "number") {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  if (data.quantity <= 0) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  return { valid: true, error: null };
}

export function validateTransactionId(transactionId: string): ValidationResult {
  if (!transactionId?.trim()) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  return { valid: true, error: null };
}

export function validateTransactionType(
  type: TransactionType | null | undefined,
): ValidationResult {
  if (!type) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  const validTypes: TransactionType[] = [
    "SALE",
    "PURCHASE",
    "DAMAGE",
    "STOCK_ADJUSTMENT",
    "TRANSFER_IN",
    "TRANSFER_OUT",
    "RETURN_SALE",
    "RETURN_PURCHASE",
  ];

  if (!validTypes.includes(type)) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  return { valid: true, error: null };
}
