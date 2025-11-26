import type { ERROR_CODE } from "@/server/constants/errors";
import type { OrderCalculationResult } from "../business-logic/orders/calculate-order-totals";

/**
 * Validates that order calculation results are mathematically sound
 */
export function validateOrderCalculation(
  calc: OrderCalculationResult & { error: ERROR_CODE | null },
  pricesIncludeTax: boolean = false
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // All values must be non-negative
  if (calc.subtotal < 0) errors.push("Subtotal cannot be negative");
  if (calc.discounts < 0) errors.push("Discounts cannot be negative");
  if (calc.tax < 0) errors.push("Tax cannot be negative");
  if (calc.shipping < 0) errors.push("Shipping cannot be negative");
  if (calc.total < 0) errors.push("Total cannot be negative");

  // Discounts cannot exceed subtotal
  if (calc.discounts > calc.subtotal) {
    errors.push(
      `Discounts ($${calc.discounts}) cannot exceed subtotal ($${calc.subtotal})`
    );
  }

  // Validate total calculation
  let expectedTotal: number;
  if (pricesIncludeTax) {
    // Tax is already in subtotal, so: Total = Subtotal - Discounts + Shipping
    expectedTotal = calc.subtotal - calc.discounts + calc.shipping;
  } else {
    // Tax is extra: Total = Subtotal - Discounts + Tax + Shipping
    expectedTotal = calc.subtotal - calc.discounts + calc.tax + calc.shipping;
  }

  // Allow for small rounding differences (within 1 cent)
  const totalDifference = Math.abs(calc.total - expectedTotal);
  if (totalDifference > 0.01) {
    errors.push(
      `Total mismatch: expected $${expectedTotal.toFixed(2)}, got $${calc.total.toFixed(2)}`
    );
  }

  // Check for calculation error
  if (calc.error) {
    errors.push(`Calculation error: ${calc.error}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate price is reasonable (not negative, not excessively large)
 */
export function validatePrice(
  price: number,
  fieldName: string = "Price"
): {
  valid: boolean;
  error?: string;
} {
  if (price < 0) {
    return { valid: false, error: `${fieldName} cannot be negative` };
  }

  // Prevent unreasonably large prices (over 1 billion)
  if (price > 1_000_000_000) {
    return {
      valid: false,
      error: `${fieldName} exceeds maximum value of 1,000,000,000`,
    };
  }

  if (!Number.isFinite(price)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  return { valid: true };
}

/**
 * Validate quantity is reasonable
 */
export function validateQuantity(
  quantity: number,
  fieldName: string = "Quantity"
): {
  valid: boolean;
  error?: string;
} {
  if (quantity < 0) {
    return { valid: false, error: `${fieldName} cannot be negative` };
  }

  if (!Number.isInteger(quantity)) {
    return {
      valid: false,
      error: `${fieldName} must be a whole number`,
    };
  }

  if (quantity > 1_000_000) {
    return {
      valid: false,
      error: `${fieldName} exceeds maximum value of 1,000,000`,
    };
  }

  return { valid: true };
}

/**
 * Validate tax rate is within acceptable range
 */
export function validateTaxRate(rate: number): {
  valid: boolean;
  error?: string;
} {
  if (rate < 0) {
    return { valid: false, error: "Tax rate cannot be negative" };
  }

  if (rate > 100) {
    return { valid: false, error: "Tax rate cannot exceed 100%" };
  }

  return { valid: true };
}
