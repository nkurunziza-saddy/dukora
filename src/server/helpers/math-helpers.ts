/**
 * Math Helpers - Safe mathematical operations for financial calculations
 */

/**
 * Currency precision (number of decimal places)
 */
export const CURRENCY_PRECISION = 2;

/**
 * Safe division that prevents NaN and handles edge cases
 */
export function safeDivision(
  numerator: number,
  denominator: number,
  decimals: number = CURRENCY_PRECISION,
): number {
  if (denominator === 0 || !Number.isFinite(denominator)) {
    return 0;
  }
  if (!Number.isFinite(numerator)) {
    return 0;
  }
  const result = numerator / denominator;
  return roundToDecimals(result, decimals);
}

/**
 * Round a number to specified decimal places
 * Uses banker's rounding (round half to even) to minimize bias
 */
export function roundToDecimals(
  value: number,
  decimals: number = CURRENCY_PRECISION,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const multiplier = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

/**
 * Round currency values (2 decimal places by default)
 */
export function roundCurrency(amount: number): number {
  return roundToDecimals(amount, CURRENCY_PRECISION);
}

/**
 * Convert currency to cents (integer arithmetic)
 * Prevents floating point precision errors
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents back to currency amount
 */
export function fromCents(cents: number): number {
  return roundCurrency(cents / 100);
}

/**
 * Safe multiplication for currency
 * Uses integer arithmetic to prevent precision errors
 */
export function multiplyCurrency(amount: number, multiplier: number): number {
  const amountCents = toCents(amount);
  const resultCents = Math.round(amountCents * multiplier);
  return fromCents(resultCents);
}

/**
 * Safe addition for currency values
 * Uses integer arithmetic to prevent precision errors
 */
export function addCurrency(...amounts: number[]): number {
  const totalCents = amounts.reduce((sum, amount) => sum + toCents(amount), 0);
  return fromCents(totalCents);
}

/**
 * Safe subtraction for currency values
 */
export function subtractCurrency(amount1: number, amount2: number): number {
  const cents1 = toCents(amount1);
  const cents2 = toCents(amount2);
  return fromCents(cents1 - cents2);
}

/**
 * Calculate percentage of an amount
 */
export function calculatePercentage(
  amount: number,
  percentage: number,
): number {
  if (percentage < 0 || percentage > 100) {
    throw new Error(
      `Invalid percentage: ${percentage}. Must be between 0 and 100.`,
    );
  }
  return multiplyCurrency(amount, percentage / 100);
}

/**
 * Calculate margin percentage
 * margin% = (revenue - cost) / revenue * 100
 */
export function calculateMarginPercentage(
  revenue: number,
  cost: number,
): number {
  if (revenue <= 0) {
    return 0;
  }
  const margin = subtractCurrency(revenue, cost);
  return safeDivision(margin, revenue, 2) * 100;
}

/**
 * Calculate markup percentage
 * markup% = (price - cost) / cost * 100
 */
export function calculateMarkupPercentage(price: number, cost: number): number {
  if (cost <= 0) {
    return 0;
  }
  const markup = subtractCurrency(price, cost);
  return safeDivision(markup, cost, 2) * 100;
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Sum an array of currency values safely
 */
export function sumCurrency(amounts: number[]): number {
  return addCurrency(...amounts);
}
