import { ERROR_CODE } from "@/server/constants/errors";

export type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: string;
  discount?: string;
};

export type OrderCalculationResult = {
  subtotal: number;
  netSubtotal: number;
  grossSubtotal: number;
  discounts: number;
  tax: number;
  shipping: number;
  total: number;
  pricesIncludeTax: boolean;
};

export type CalculationResult = {
  value: number;
  error: ERROR_CODE | null;
};

function parseNumeric(value: string | undefined, defaultValue = 0): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : Math.max(0, parsed);
}

export function calculateOrderSubtotal(items: OrderItem[]): CalculationResult {
  if (!Array.isArray(items)) {
    return { value: 0, error: ERROR_CODE.MISSING_INPUT };
  }

  if (items.length === 0) {
    return { value: 0, error: ERROR_CODE.MISSING_INPUT };
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
    return { value: 0, error: ERROR_CODE.FAILED_REQUEST };
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
    return { value: 0, error: ERROR_CODE.FAILED_REQUEST };
  }
}

import { calculateNetPrice, calculateTaxAmount } from "../taxes/calculate-tax";

export function calculateOrderTax(
  subtotal: number,
  taxRate: number,
  pricesIncludeTax: boolean = false
): CalculationResult {
  if (typeof subtotal !== "number" || subtotal < 0) {
    return { value: 0, error: ERROR_CODE.MISSING_INPUT };
  }

  if (typeof taxRate !== "number" || taxRate < 0 || taxRate > 100) {
    return { value: 0, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const tax = calculateTaxAmount(subtotal, taxRate, pricesIncludeTax);
    return { value: tax, error: null };
  } catch (error) {
    console.error("Error calculating tax:", error);
    return { value: 0, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export function calculateOrderShipping(
  items: OrderItem[],
  shippingRate = 0
): CalculationResult {
  if (!Array.isArray(items)) {
    return { value: 0, error: ERROR_CODE.MISSING_INPUT };
  }

  if (typeof shippingRate !== "number" || shippingRate < 0) {
    return { value: 0, error: ERROR_CODE.MISSING_INPUT };
  }

  // Future: Can calculate based on item count, weight, etc.
  // For now, just return the fixed rate
  return { value: shippingRate, error: null };
}

export function calculateOrderTotal(
  subtotal: number,
  discounts: number,
  tax = 0,
  shipping = 0
): CalculationResult {
  if (
    typeof subtotal !== "number" ||
    typeof discounts !== "number" ||
    typeof tax !== "number" ||
    typeof shipping !== "number"
  ) {
    return { value: 0, error: ERROR_CODE.MISSING_INPUT };
  }

  const validSubtotal = Math.max(0, subtotal);
  const validDiscounts = Math.max(0, discounts);
  const validTax = Math.max(0, tax);
  const validShipping = Math.max(0, shipping);

  if (validDiscounts > validSubtotal) {
    return { value: 0, error: ERROR_CODE.BAD_REQUEST };
  }

  try {
    const total = validSubtotal - validDiscounts + validTax + validShipping;
    return { value: Math.max(0, total), error: null };
  } catch (error) {
    console.error("Error calculating total:", error);
    return { value: 0, error: ERROR_CODE.FAILED_REQUEST };
  }
}

export function calculateAllOrderAmounts(
  items: OrderItem[],
  taxRate = 0,
  shippingRate = 0,
  pricesIncludeTax = false
): OrderCalculationResult & {
  error: ERROR_CODE | null;
  netSubtotal: number;
  grossSubtotal: number;
  pricesIncludeTax: boolean;
} {
  const subtotalResult = calculateOrderSubtotal(items);
  const discountsResult = calculateOrderDiscounts(items);

  if (subtotalResult.error) {
    return {
      subtotal: 0,
      netSubtotal: 0,
      grossSubtotal: 0,
      discounts: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      pricesIncludeTax,
      error: subtotalResult.error,
    };
  }

  const taxResult = calculateOrderTax(
    subtotalResult.value,
    taxRate,
    pricesIncludeTax
  );
  const shippingResult = calculateOrderShipping(items, shippingRate);

  let netSubtotal: number;
  let grossSubtotal: number;

  if (pricesIncludeTax) {
    grossSubtotal = subtotalResult.value;
    netSubtotal = calculateNetPrice(subtotalResult.value, taxRate, true);
  } else {
    netSubtotal = subtotalResult.value;
    grossSubtotal = subtotalResult.value + taxResult.value;
  }

  const taxToAdd = pricesIncludeTax ? 0 : taxResult.value;

  const totalResult = calculateOrderTotal(
    subtotalResult.value,
    discountsResult.value,
    taxToAdd,
    shippingResult.value
  );

  return {
    subtotal: subtotalResult.value,
    netSubtotal,
    grossSubtotal,
    discounts: discountsResult.value,
    tax: taxResult.value,
    shipping: shippingResult.value,
    total: totalResult.value,
    pricesIncludeTax,
    error: totalResult.error,
  };
}
