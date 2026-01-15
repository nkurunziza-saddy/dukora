import { ERROR_CODE } from "@/server/constants/errors";
import type { OrderItem } from "./calculate-order-totals";

export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type ValidationResult = {
  valid: boolean;
  error: ERROR_CODE | null;
};

export function validateOrderItems(items: OrderItem[]): ValidationResult {
  if (!Array.isArray(items)) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  if (items.length === 0) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  for (const item of items) {
    if (!item) {
      return { valid: false, error: ERROR_CODE.MISSING_INPUT };
    }

    if (!item.productId || !item.productId.trim()) {
      return { valid: false, error: ERROR_CODE.MISSING_INPUT };
    }

    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      return { valid: false, error: ERROR_CODE.MISSING_INPUT };
    }

    if (!item.unitPrice || !item.unitPrice.trim()) {
      return { valid: false, error: ERROR_CODE.MISSING_INPUT };
    }

    const price = parseFloat(item.unitPrice);
    if (Number.isNaN(price) || price < 0) {
      return { valid: false, error: ERROR_CODE.MISSING_INPUT };
    }

    if (item.discount) {
      const discount = parseFloat(item.discount);
      if (Number.isNaN(discount) || discount < 0) {
        return { valid: false, error: ERROR_CODE.MISSING_INPUT };
      }
    }
  }

  return { valid: true, error: null };
}

export function validateCustomerInfo(
  email: string,
  name: string,
  phone?: string,
): ValidationResult {
  if (!email || !email.trim()) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  if (!name || !name.trim()) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  if (phone?.trim()) {
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return { valid: false, error: ERROR_CODE.MISSING_INPUT };
    }
  }

  return { valid: true, error: null };
}

export function validateAddress(address: Address): ValidationResult {
  if (!address) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  const requiredFields: (keyof Address)[] = [
    "street",
    "city",
    "state",
    "postalCode",
    "country",
  ];

  for (const field of requiredFields) {
    const value = address[field];
    if (!value || !value.trim()) {
      return { valid: false, error: ERROR_CODE.MISSING_INPUT };
    }
  }

  return { valid: true, error: null };
}

export function validateOrderId(orderId: string): ValidationResult {
  if (!orderId || !orderId.trim()) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  return { valid: true, error: null };
}

export function validateOrderNumber(orderNumber: string): ValidationResult {
  if (!orderNumber || !orderNumber.trim()) {
    return { valid: false, error: ERROR_CODE.MISSING_INPUT };
  }

  return { valid: true, error: null };
}
