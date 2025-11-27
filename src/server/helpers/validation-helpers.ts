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
