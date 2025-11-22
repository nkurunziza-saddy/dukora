import { calculateTaxAmount } from "../../../src/server/business-logic/taxes/calculate-tax";

// Mock data
const product = {
  name: "Test Product",
  price: "100.00",
  costPrice: "50.00",
};

const transaction = {
  quantity: 2,
  type: "SALE",
};

const settingsExclusive = {
  defaultVatRate: "18",
  pricesIncludeTax: "false",
};

const settingsInclusive = {
  defaultVatRate: "18",
  pricesIncludeTax: "true",
};

function testNotificationLogic(settings: any, description: string) {
  console.log(`\nTesting: ${description}`);

  const taxRate = Number(settings.defaultVatRate);
  const pricesIncludeTax = settings.pricesIncludeTax === "true";

  const rawAmount = transaction.quantity * Number(product.price); // 2 * 100 = 200
  let finalAmount = rawAmount;
  let taxAmount = 0;

  if (pricesIncludeTax) {
    taxAmount = calculateTaxAmount(rawAmount, taxRate, true);
    finalAmount = rawAmount;
  } else {
    taxAmount = calculateTaxAmount(rawAmount, taxRate, false);
    finalAmount = rawAmount + taxAmount;
  }

  const taxText = taxAmount > 0 ? ` (incl. ${taxAmount.toFixed(2)} Tax)` : "";
  const message = `A new sale of ${transaction.quantity} ${product.name} was recorded. Total: ${finalAmount.toFixed(2)}${taxText}`;

  console.log(`  Raw Amount: ${rawAmount}`);
  console.log(`  Tax Rate: ${taxRate}%`);
  console.log(`  Inclusive: ${pricesIncludeTax}`);
  console.log(`  Calculated Tax: ${taxAmount}`);
  console.log(`  Final Amount: ${finalAmount}`);
  console.log(`  Message: "${message}"`);

  return { finalAmount, taxAmount, message };
}

console.log("=== Transaction Notification Logic Verification ===");

// Test Exclusive
const exclusiveResult = testNotificationLogic(
  settingsExclusive,
  "Exclusive Tax (18%)"
);
if (exclusiveResult.finalAmount === 236 && exclusiveResult.taxAmount === 36) {
  console.log("  ✓ Exclusive calculation correct");
} else {
  console.error("  ✗ Exclusive calculation failed");
}

// Test Inclusive
const inclusiveResult = testNotificationLogic(
  settingsInclusive,
  "Inclusive Tax (18%)"
);
// 200 inclusive at 18% -> Tax = 200 - (200/1.18) = 30.51
if (
  inclusiveResult.finalAmount === 200 &&
  inclusiveResult.taxAmount === 30.51
) {
  console.log("  ✓ Inclusive calculation correct");
} else {
  console.error("  ✗ Inclusive calculation failed");
}
