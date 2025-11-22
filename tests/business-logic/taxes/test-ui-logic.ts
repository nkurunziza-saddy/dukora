// Mock data simulating UI state
const settingsExclusive = [
  { key: "defaultVatRate", value: "18" },
  { key: "pricesIncludeTax", value: "false" },
];

const settingsInclusive = [
  { key: "defaultVatRate", value: "18" },
  { key: "pricesIncludeTax", value: "true" },
];

const product = {
  id: "prod-1",
  price: "100.00",
};

const quantity = 2;

function calculateUiTotals(settings: any[], description: string) {
  console.log(`\nTesting UI Logic: ${description}`);

  const taxRate =
    Number(settings.find((s) => s.key === "defaultVatRate")?.value) || 0;
  const pricesIncludeTax =
    settings.find((s) => s.key === "pricesIncludeTax")?.value === "true";

  const price = Number(product.price);
  const rawTotal = price * quantity;

  let result;

  if (pricesIncludeTax) {
    // Price includes tax
    // Tax = Total - (Total / (1 + Rate))
    const taxAmount = rawTotal - rawTotal / (1 + taxRate / 100);
    result = {
      subtotal: rawTotal - taxAmount,
      tax: taxAmount,
      total: rawTotal,
    };
  } else {
    // Price excludes tax
    const taxAmount = rawTotal * (taxRate / 100);
    result = {
      subtotal: rawTotal,
      tax: taxAmount,
      total: rawTotal + taxAmount,
    };
  }

  console.log(`  Raw Total: ${rawTotal}`);
  console.log(`  Tax Rate: ${taxRate}%`);
  console.log(`  Inclusive: ${pricesIncludeTax}`);
  console.log(`  Subtotal: ${result.subtotal.toFixed(2)}`);
  console.log(`  Tax: ${result.tax.toFixed(2)}`);
  console.log(`  Total: ${result.total.toFixed(2)}`);

  return result;
}

console.log("=== UI Tax Calculation Logic Verification ===");

// Test Exclusive
const exclusiveResult = calculateUiTotals(
  settingsExclusive,
  "Exclusive Tax (18%)",
);
if (exclusiveResult.total === 236 && exclusiveResult.tax === 36) {
  console.log("  ✓ Exclusive UI calculation correct");
} else {
  console.error("  ✗ Exclusive UI calculation failed");
}

// Test Inclusive
const inclusiveResult = calculateUiTotals(
  settingsInclusive,
  "Inclusive Tax (18%)",
);
// 200 inclusive at 18% -> Tax = 200 - (200/1.18) = 30.51
if (
  Math.abs(inclusiveResult.total - 200) < 0.01 &&
  Math.abs(inclusiveResult.tax - 30.508) < 0.01
) {
  console.log("  ✓ Inclusive UI calculation correct");
} else {
  console.error("  ✗ Inclusive UI calculation failed");
}
