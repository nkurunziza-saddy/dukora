export function validateTaxRate(rate: number): boolean {
  return (
    typeof rate === "number" && !Number.isNaN(rate) && rate >= 0 && rate <= 100
  );
}

export function validateTaxSettings(settings: {
  taxEnabled: boolean;
  taxRate: number;
  pricesIncludeTax: boolean;
}): { isValid: boolean; error?: string } {
  if (typeof settings.taxEnabled !== "boolean") {
    return { isValid: false, error: "Tax enabled must be a boolean" };
  }

  if (typeof settings.pricesIncludeTax !== "boolean") {
    return { isValid: false, error: "Prices include tax must be a boolean" };
  }

  if (!validateTaxRate(settings.taxRate)) {
    return {
      isValid: false,
      error: "Invalid tax rate. Must be between 0 and 100",
    };
  }

  return { isValid: true };
}
