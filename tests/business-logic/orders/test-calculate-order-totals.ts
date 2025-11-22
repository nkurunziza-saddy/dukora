/**
 * Test Suite for Order Calculation Functions
 *
 * Run with: npx tsx src/__tests__/business-logic/orders/test-calculate-order-totals.ts
 *
 * Tests pure calculation functions (no database/auth needed)
 */

import {
  calculateAllOrderAmounts,
  calculateOrderDiscounts,
  calculateOrderShipping,
  calculateOrderSubtotal,
  calculateOrderTax,
  calculateOrderTotal,
  type OrderItem,
} from "@/server/business-logic/orders";
import { ErrorCode } from "@/server/constants/errors";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

let testsPassed = 0;
let testsFailed = 0;

function assert(
  condition: boolean,
  testName: string,
  expected?: unknown,
  actual?: unknown,
) {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (expected !== undefined && actual !== undefined) {
      console.log(
        `  Expected: ${colors.yellow}${JSON.stringify(expected)}${colors.reset}`,
      );
      console.log(
        `  Actual:   ${colors.red}${JSON.stringify(actual)}${colors.reset}`,
      );
    }
    testsFailed++;
  }
}

function testSection(name: string) {
  console.log(`\n${colors.cyan}━━━ ${name} ━━━${colors.reset}`);
}

// ============================================================================
// Test calculateOrderSubtotal
// ============================================================================
function testCalculateOrderSubtotal() {
  testSection("calculateOrderSubtotal");

  // Test 1: Simple calculation
  const items1: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10.00" },
    { productId: "p2", quantity: 3, unitPrice: "5.00" },
  ];
  const result1 = calculateOrderSubtotal(items1);
  assert(
    result1.value === 35 && result1.error === null,
    "should calculate subtotal correctly (2*10 + 3*5 = 35)",
    35,
    result1.value,
  );

  // Test 2: Single item
  const items2: OrderItem[] = [
    { productId: "p1", quantity: 5, unitPrice: "20.50" },
  ];
  const result2 = calculateOrderSubtotal(items2);
  assert(
    result2.value === 102.5 && result2.error === null,
    "should calculate single item (5 * 20.50 = 102.5)",
    102.5,
    result2.value,
  );

  // Test 3: Empty array
  const result3 = calculateOrderSubtotal([]);
  assert(
    result3.value === 0 && result3.error === ErrorCode.MISSING_INPUT,
    "should return error for empty array",
    ErrorCode.MISSING_INPUT,
    result3.error,
  );

  // Test 4: Invalid input (not array)
  const result4 = calculateOrderSubtotal(null as any);
  assert(
    result4.error === ErrorCode.MISSING_INPUT,
    "should return error for null input",
  );

  // Test 5: Decimal prices
  const items5: OrderItem[] = [
    { productId: "p1", quantity: 3, unitPrice: "12.99" },
  ];
  const result5 = calculateOrderSubtotal(items5);
  assert(
    Math.abs(result5.value - 38.97) < 0.01,
    "should handle decimal prices correctly",
    38.97,
    result5.value,
  );

  // Test 6: Zero price
  const items6: OrderItem[] = [
    { productId: "p1", quantity: 5, unitPrice: "0" },
  ];
  const result6 = calculateOrderSubtotal(items6);
  assert(
    result6.value === 0 && result6.error === null,
    "should handle zero price",
    0,
    result6.value,
  );

  // Test 7: Invalid price string
  const items7: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "invalid" },
  ];
  const result7 = calculateOrderSubtotal(items7);
  assert(
    result7.value === 0,
    "should default to 0 for invalid price",
    0,
    result7.value,
  );

  // Test 8: Mixed valid and invalid items
  const items8: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10" },
    { productId: "p2", quantity: 0, unitPrice: "5" }, // Zero quantity
  ];
  const result8 = calculateOrderSubtotal(items8);
  assert(
    result8.value === 20,
    "should skip items with zero quantity",
    20,
    result8.value,
  );
}

// ============================================================================
// Test calculateOrderDiscounts
// ============================================================================
function testCalculateOrderDiscounts() {
  testSection("calculateOrderDiscounts");

  // Test 1: Simple discount
  const items1: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10.00", discount: "1.00" },
    { productId: "p2", quantity: 3, unitPrice: "5.00", discount: "0.50" },
  ];
  const result1 = calculateOrderDiscounts(items1);
  assert(
    result1.value === 3.5 && result1.error === null,
    "should calculate discounts correctly (2*1 + 3*0.5 = 3.5)",
    3.5,
    result1.value,
  );

  // Test 2: No discounts
  const items2: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10.00" },
    { productId: "p2", quantity: 3, unitPrice: "5.00" },
  ];
  const result2 = calculateOrderDiscounts(items2);
  assert(
    result2.value === 0 && result2.error === null,
    "should return 0 when no discounts provided",
    0,
    result2.value,
  );

  // Test 3: Empty array
  const result3 = calculateOrderDiscounts([]);
  assert(
    result3.value === 0 && result3.error === null,
    "should return 0 for empty array (not an error)",
    0,
    result3.value,
  );

  // Test 4: Null input
  const result4 = calculateOrderDiscounts(null as any);
  assert(
    result4.value === 0 && result4.error === null,
    "should return 0 for null input",
  );

  // Test 5: Mixed discounts
  const items5: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10", discount: "2" },
    { productId: "p2", quantity: 3, unitPrice: "5" }, // No discount
    { productId: "p3", quantity: 1, unitPrice: "20", discount: "5" },
  ];
  const result5 = calculateOrderDiscounts(items5);
  assert(
    result5.value === 9,
    "should handle mixed discounts (2*2 + 0 + 1*5 = 9)",
    9,
    result5.value,
  );

  // Test 6: Invalid discount string
  const items6: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10", discount: "invalid" },
  ];
  const result6 = calculateOrderDiscounts(items6);
  assert(
    result6.value === 0,
    "should default to 0 for invalid discount",
    0,
    result6.value,
  );
}

// ============================================================================
// Test calculateOrderTax
// ============================================================================
function testCalculateOrderTax() {
  testSection("calculateOrderTax");

  // Test 1: 10% tax
  const result1 = calculateOrderTax(100, 10);
  assert(
    result1.value === 10 && result1.error === null,
    "should calculate 10% tax on 100 = 10",
    10,
    result1.value,
  );

  // Test 2: 8.5% tax
  const result2 = calculateOrderTax(50, 8.5);
  assert(
    result2.value === 4.25 && result2.error === null,
    "should calculate 8.5% tax on 50 = 4.25",
    4.25,
    result2.value,
  );

  // Test 3: 0% tax
  const result3 = calculateOrderTax(100, 0);
  assert(
    result3.value === 0 && result3.error === null,
    "should handle 0% tax",
    0,
    result3.value,
  );

  // Test 4: Negative subtotal (invalid)
  const result4 = calculateOrderTax(-100, 10);
  assert(
    result4.error === ErrorCode.MISSING_INPUT,
    "should return error for negative subtotal",
  );

  // Test 5: Invalid tax rate (negative)
  const result5 = calculateOrderTax(100, -10);
  assert(
    result5.error === ErrorCode.MISSING_INPUT,
    "should return error for negative tax rate",
  );

  // Test 6: Invalid tax rate (> 100%)
  const result6 = calculateOrderTax(100, 150);
  assert(
    result6.error === ErrorCode.MISSING_INPUT,
    "should return error for tax rate > 100%",
  );
}

// ============================================================================
// Test calculateOrderShipping
// ============================================================================
function testCalculateOrderShipping() {
  testSection("calculateOrderShipping");

  // Test 1: Fixed shipping rate
  const items1: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10" },
  ];
  const result1 = calculateOrderShipping(items1, 15);
  assert(
    result1.value === 15 && result1.error === null,
    "should return fixed shipping rate",
    15,
    result1.value,
  );

  // Test 2: Zero shipping
  const result2 = calculateOrderShipping(items1, 0);
  assert(
    result2.value === 0 && result2.error === null,
    "should handle zero shipping",
    0,
    result2.value,
  );

  // Test 3: Default shipping (no rate provided)
  const result3 = calculateOrderShipping(items1);
  assert(
    result3.value === 0 && result3.error === null,
    "should default to 0 when no rate provided",
    0,
    result3.value,
  );

  // Test 4: Negative shipping rate (invalid)
  const result4 = calculateOrderShipping(items1, -10);
  assert(
    result4.error === ErrorCode.MISSING_INPUT,
    "should return error for negative shipping rate",
  );
}

// ============================================================================
// Test calculateOrderTotal
// ============================================================================
function testCalculateOrderTotal() {
  testSection("calculateOrderTotal");

  // Test 1: Simple total
  const result1 = calculateOrderTotal(100, 10, 5, 15);
  assert(
    result1.value === 110 && result1.error === null,
    "should calculate total (100 - 10 + 5 + 15 = 110)",
    110,
    result1.value,
  );

  // Test 2: No discounts, tax, or shipping
  const result2 = calculateOrderTotal(100, 0, 0, 0);
  assert(
    result2.value === 100 && result2.error === null,
    "should return subtotal when no other amounts",
    100,
    result2.value,
  );

  // Test 3: Discount exceeds subtotal
  const result3 = calculateOrderTotal(50, 100, 0, 0);
  assert(
    result3.error === ErrorCode.BAD_REQUEST,
    "should return error when discount > subtotal",
  );

  // Test 4: With defaults (only subtotal and discounts)
  const result4 = calculateOrderTotal(100, 10);
  assert(
    result4.value === 90 && result4.error === null,
    "should use default values for tax and shipping",
    90,
    result4.value,
  );

  // Test 5: Negative values converted to positive
  const result5 = calculateOrderTotal(100, 20, 5, 10);
  assert(
    result5.value === 95 && result5.error === null,
    "should handle all components (100 - 20 + 5 + 10 = 95)",
    95,
    result5.value,
  );

  // Test 6: Invalid input types
  const result6 = calculateOrderTotal("100" as any, 10);
  assert(
    result6.error === ErrorCode.MISSING_INPUT,
    "should return error for invalid input types",
  );
}

// ============================================================================
// Test calculateAllOrderAmounts
// ============================================================================
function testCalculateAllOrderAmounts() {
  testSection("calculateAllOrderAmounts");

  // Test 1: Complete order calculation
  const items1: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10.00", discount: "1.00" },
    { productId: "p2", quantity: 3, unitPrice: "5.00", discount: "0.50" },
  ];
  const result1 = calculateAllOrderAmounts(items1, 10, 15);
  assert(
    result1.subtotal === 35 &&
      result1.discounts === 3.5 &&
      result1.tax === 3.5 &&
      result1.shipping === 15 &&
      result1.total === 50 &&
      result1.error === null,
    "should calculate all amounts correctly (35 - 3.5 + 3.5 + 15 = 50)",
    { subtotal: 35, discounts: 3.5, tax: 3.5, shipping: 15, total: 50 },
    {
      subtotal: result1.subtotal,
      discounts: result1.discounts,
      tax: result1.tax,
      shipping: result1.shipping,
      total: result1.total,
    },
  );

  // Test 2: With defaults (no tax/shipping)
  const result2 = calculateAllOrderAmounts(items1);
  assert(
    result2.subtotal === 35 &&
      result2.discounts === 3.5 &&
      result2.tax === 0 &&
      result2.shipping === 0 &&
      result2.total === 31.5 &&
      result2.error === null,
    "should use defaults for tax and shipping",
    31.5,
    result2.total,
  );

  // Test 3: Invalid items
  const result3 = calculateAllOrderAmounts([]);
  assert(
    result3.error === ErrorCode.MISSING_INPUT,
    "should return error for empty items",
  );

  // Test 4: Tax Inclusive
  // Subtotal: 118 (inc 18% tax) -> Net 100, Tax 18
  // Shipping: 10
  // Total should be 118 + 10 = 128
  const items4: OrderItem[] = [
    { productId: "p1", quantity: 1, unitPrice: "118.00" },
  ];
  const result4 = calculateAllOrderAmounts(items4, 18, 10, true);
  assert(
    result4.subtotal === 118 &&
      result4.tax === 18 &&
      result4.total === 128 &&
      result4.error === null,
    "should calculate inclusive tax correctly",
    { subtotal: 118, tax: 18, total: 128 },
    { subtotal: result4.subtotal, tax: result4.tax, total: result4.total },
  );
}

// ============================================================================
// Run All Tests
// ============================================================================
async function runAllTests() {
  console.log(
    `${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.blue}║  Order Calculation Test Suite                             ║${colors.reset}`,
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`,
  );

  testCalculateOrderSubtotal();
  testCalculateOrderDiscounts();
  testCalculateOrderTax();
  testCalculateOrderShipping();
  testCalculateOrderTotal();
  testCalculateAllOrderAmounts();

  // Summary
  console.log(
    `\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`,
  );
  console.log(`${colors.cyan}Test Summary:${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`  Total:  ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log(`\n${colors.green}✓ All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed!${colors.reset}\n`);
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch((error) => {
  console.error(
    `${colors.red}Test suite failed with error:${colors.reset}`,
    error,
  );
  process.exit(1);
});
