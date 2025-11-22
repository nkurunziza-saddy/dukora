import { ErrorCode } from "@/server/constants/errors";

export type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: string;
  discount?: string;
};

export type OrderCalculationResult = {
  subtotal: number;
  discounts: number;
  tax: number;
  shipping: number;
  total: number;
};

export type CalculationResult = {
  value: number;
  error: ErrorCode | null;
};

function parseNumeric(value: string | undefined, defaultValue = 0): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : Math.max(0, parsed);
}

export function calculateOrderSubtotal(items: OrderItem[]): CalculationResult {
  if (!Array.isArray(items)) {
    return { value: 0, error: ErrorCode.MISSING_INPUT };
  }

  if (items.length === 0) {
    return { value: 0, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const subtotal = items.reduce((sum, item) => {
      if (!item || typeof item.quantity !== "number") {
        return sum;
      }

      const quantity = Math.abs(item.quantity);
      const unitPrice = parseNumeric(item.unitPrice, 0);

      return sum + quantity * unitPrice;
    }, 0);

    return { value: subtotal, error: null };
  } catch (error) {
    console.error("Error calculating subtotal:", error);
    return { value: 0, error: ErrorCode.FAILED_REQUEST };
  }
}

export function calculateOrderDiscounts(items: OrderItem[]): CalculationResult {
  if (!Array.isArray(items)) {
    return { value: 0, error: null };
  }

  if (items.length === 0) {
    return { value: 0, error: null };
  }

  try {
    const discounts = items.reduce((sum, item) => {
      if (!item || typeof item.quantity !== "number") {
        return sum;
      }

      const quantity = Math.abs(item.quantity);
      const discount = parseNumeric(item.discount, 0);

      return sum + quantity * discount;
    }, 0);

    return { value: discounts, error: null };
  } catch (error) {
    console.error("Error calculating discounts:", error);
    return { value: 0, error: ErrorCode.FAILED_REQUEST };
  }
}

import { calculateTaxAmount } from "../taxes/calculate-tax";

export function calculateOrderTax(
  subtotal: number,
  taxRate: number,
  pricesIncludeTax: boolean = false,
): CalculationResult {
  if (typeof subtotal !== "number" || subtotal < 0) {
    return { value: 0, error: ErrorCode.MISSING_INPUT };
  }

  if (typeof taxRate !== "number" || taxRate < 0 || taxRate > 100) {
    return { value: 0, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const tax = calculateTaxAmount(subtotal, taxRate, pricesIncludeTax);
    return { value: tax, error: null };
  } catch (error) {
    console.error("Error calculating tax:", error);
    return { value: 0, error: ErrorCode.FAILED_REQUEST };
  }
}

export function calculateOrderShipping(
  items: OrderItem[],
  shippingRate = 0,
): CalculationResult {
  if (!Array.isArray(items)) {
    return { value: 0, error: ErrorCode.MISSING_INPUT };
  }

  if (typeof shippingRate !== "number" || shippingRate < 0) {
    return { value: 0, error: ErrorCode.MISSING_INPUT };
  }

  // Future: Can calculate based on item count, weight, etc.
  // For now, just return the fixed rate
  return { value: shippingRate, error: null };
}

export function calculateOrderTotal(
  subtotal: number,
  discounts: number,
  tax = 0,
  shipping = 0,
): CalculationResult {
  if (
    typeof subtotal !== "number" ||
    typeof discounts !== "number" ||
    typeof tax !== "number" ||
    typeof shipping !== "number"
  ) {
    return { value: 0, error: ErrorCode.MISSING_INPUT };
  }

  const validSubtotal = Math.max(0, subtotal);
  const validDiscounts = Math.max(0, discounts);
  const validTax = Math.max(0, tax);
  const validShipping = Math.max(0, shipping);

  if (validDiscounts > validSubtotal) {
    return { value: 0, error: ErrorCode.BAD_REQUEST };
  }

  try {
    const total = validSubtotal - validDiscounts + validTax + validShipping;
    return { value: Math.max(0, total), error: null };
  } catch (error) {
    console.error("Error calculating total:", error);
    return { value: 0, error: ErrorCode.FAILED_REQUEST };
  }
}

export function calculateAllOrderAmounts(
  items: OrderItem[],
  taxRate = 0,
  shippingRate = 0,
  pricesIncludeTax = false,
): OrderCalculationResult & { error: ErrorCode | null } {
  const subtotalResult = calculateOrderSubtotal(items);
  const discountsResult = calculateOrderDiscounts(items);

  if (subtotalResult.error) {
    return {
      subtotal: 0,
      discounts: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      error: subtotalResult.error,
    };
  }

  const taxResult = calculateOrderTax(
    subtotalResult.value,
    taxRate,
    pricesIncludeTax,
  );
  const shippingResult = calculateOrderShipping(items, shippingRate);

  // For inclusive tax, the total is just subtotal - discounts + shipping (tax is already inside subtotal)
  // BUT, calculateOrderTotal adds tax to subtotal.
  // If prices are inclusive, we need to be careful.
  // Usually "Total" means "Amount to Pay".
  // If inclusive: Subtotal (inc tax) - Discount + Shipping = Total to Pay.
  // If exclusive: Subtotal (ex tax) - Discount + Tax + Shipping = Total to Pay.

  // Let's adjust how we call calculateOrderTotal based on inclusive/exclusive.
  // Actually, calculateOrderTotal logic is: subtotal - discounts + tax + shipping.
  // If inclusive, 'tax' parameter passed to calculateOrderTotal should be 0 because it's already in subtotal?
  // OR we should adjust subtotal to be net before passing to calculateOrderTotal?

  // Standard approach:
  // Inclusive:
  // Subtotal = 118 (inc 18 tax)
  // Tax = 18
  // Total = 118.
  // If we pass subtotal=118, tax=18 to calculateOrderTotal, it does 118+18 = 136. WRONG.

  // So if inclusive, we should probably pass tax=0 to calculateOrderTotal OR pass net subtotal.
  // Let's keep subtotal as the raw sum of item prices.
  // If inclusive, we pass tax=0 to calculateOrderTotal so it doesn't add it again.
  // Wait, but we want the 'tax' field in the result to show the tax amount.

  const taxToAdd = pricesIncludeTax ? 0 : taxResult.value;

  const totalResult = calculateOrderTotal(
    subtotalResult.value,
    discountsResult.value,
    taxToAdd,
    shippingResult.value,
  );

  return {
    subtotal: subtotalResult.value,
    discounts: discountsResult.value,
    tax: taxResult.value,
    shipping: shippingResult.value,
    total: totalResult.value,
    error: totalResult.error,
  };
}
