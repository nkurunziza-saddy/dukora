function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates the tax amount for a given price and tax rate.
 * Supports both tax-exclusive (add tax on top) and tax-inclusive (extract tax from price) calculations.
 *
 * @param price - The price to calculate tax for
 * @param taxRate - The tax rate as a percentage (e.g., 18 for 18%)
 * @param pricesIncludeTax - Whether the given price already includes tax
 * @returns The calculated tax amount
 */
export function calculateTaxAmount(
  price: number,
  taxRate: number,
  pricesIncludeTax: boolean = false
): number {
  if (price < 0 || taxRate < 0) return 0;
  if (taxRate === 0) return 0;

  let taxAmount = 0;

  if (pricesIncludeTax) {
    // Formula: Tax = Price - (Price / (1 + Rate/100))
    // Example: 118 inclusive at 18% -> 118 - (118 / 1.18) = 118 - 100 = 18
    taxAmount = price - price / (1 + taxRate / 100);
  } else {
    // Formula: Tax = Price * (Rate/100)
    // Example: 100 exclusive at 18% -> 100 * 0.18 = 18
    taxAmount = price * (taxRate / 100);
  }

  return roundToTwoDecimals(taxAmount);
}

/**
 * Calculates the net price (price without tax) for a given price and tax rate.
 *
 * @param price - The price to calculate net price for
 * @param taxRate - The tax rate as a percentage
 * @param pricesIncludeTax - Whether the given price already includes tax
 * @returns The net price
 */
export function calculateNetPrice(
  price: number,
  taxRate: number,
  pricesIncludeTax: boolean = false
): number {
  if (price < 0 || taxRate < 0) return 0;
  if (taxRate === 0) return roundToTwoDecimals(price);

  let netPrice = 0;

  if (pricesIncludeTax) {
    // Net = Price / (1 + Rate/100)
    netPrice = price / (1 + taxRate / 100);
  } else {
    netPrice = price;
  }

  return roundToTwoDecimals(netPrice);
}

/**
 * Calculates the total price (price + tax) for a given price and tax rate.
 *
 * @param price - The price to calculate total for
 * @param taxRate - The tax rate as a percentage
 * @param pricesIncludeTax - Whether the given price already includes tax
 * @returns The total price including tax
 */
export function calculateTotalWithTax(
  price: number,
  taxRate: number,
  pricesIncludeTax: boolean = false
): number {
  if (price < 0 || taxRate < 0) return 0;
  if (taxRate === 0) return roundToTwoDecimals(price);

  let total = 0;

  if (pricesIncludeTax) {
    total = price;
  } else {
    // Total = Price * (1 + Rate/100)
    total = price * (1 + taxRate / 100);
  }

  return roundToTwoDecimals(total);
}
