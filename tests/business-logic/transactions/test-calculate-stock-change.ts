/**
 * Test Suite for Stock Change Calculation Functions
 *
 * Run with: npx tsx src/__tests__/business-logic/transactions/test-calculate-stock-change.ts
 *
 * Tests pure stock calculation functions (no database/auth needed)
 */

import type { TransactionType } from "@/lib/schema/schema.types";
import {
  calculateStockChange,
  isStockDecreaseType,
  isStockIncreaseType,
} from "@/server/business-logic/transactions";

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
// Test calculateStockChange
// ============================================================================
function testCalculateStockChange() {
  testSection("calculateStockChange - Decrease Types");

  // Stock decrease types
  const decreaseTests: [TransactionType, number, number][] = [
    ["SALE", 10, -10],
    ["DAMAGE", 5, -5],
    ["TRANSFER_OUT", 20, -20],
    ["RETURN_PURCHASE", 8, -8],
  ];

  decreaseTests.forEach(([type, quantity, expected]) => {
    const result = calculateStockChange(type, quantity);
    assert(
      result === expected,
      `${type} with quantity ${quantity} should return ${expected}`,
      expected,
      result,
    );
  });

  testSection("calculateStockChange - Increase Types");

  // Stock increase types
  const increaseTests: [TransactionType, number, number][] = [
    ["PURCHASE", 10, 10],
    ["TRANSFER_IN", 5, 5],
    ["RETURN_SALE", 12, 12],
  ];

  increaseTests.forEach(([type, quantity, expected]) => {
    const result = calculateStockChange(type, quantity);
    assert(
      result === expected,
      `${type} with quantity ${quantity} should return ${expected}`,
      expected,
      result,
    );
  });

  testSection("calculateStockChange - Special Cases");

  // STOCK_ADJUSTMENT can be positive or negative
  const result1 = calculateStockChange("STOCK_ADJUSTMENT", 10);
  assert(
    result1 === 10,
    "STOCK_ADJUSTMENT with positive quantity returns positive",
    10,
    result1,
  );

  const result2 = calculateStockChange("STOCK_ADJUSTMENT", -10);
  assert(
    result2 === -10,
    "STOCK_ADJUSTMENT with negative quantity returns negative",
    -10,
    result2,
  );

  // Negative quantities should be converted to absolute
  const result3 = calculateStockChange("SALE", -10);
  assert(
    result3 === -10,
    "SALE with negative quantity should still decrease stock",
    -10,
    result3,
  );

  const result4 = calculateStockChange("PURCHASE", -10);
  assert(
    result4 === 10,
    "PURCHASE with negative quantity should still increase stock",
    10,
    result4,
  );

  // Zero quantity
  const result5 = calculateStockChange("SALE", 0);
  assert(result5 === 0, "Zero quantity should return 0", 0, result5);
}

// ============================================================================
// Test isStockDecreaseType
// ============================================================================
function testIsStockDecreaseType() {
  testSection("isStockDecreaseType");

  // Test decrease types
  const decreaseTypes: TransactionType[] = [
    "SALE",
    "DAMAGE",
    "TRANSFER_OUT",
    "RETURN_PURCHASE",
  ];

  decreaseTypes.forEach((type) => {
    const result = isStockDecreaseType(type);
    assert(result === true, `${type} should be a decrease type`, true, result);
  });

  // Test non-decrease types
  const nonDecreaseTypes: TransactionType[] = [
    "PURCHASE",
    "TRANSFER_IN",
    "RETURN_SALE",
    "STOCK_ADJUSTMENT",
  ];

  nonDecreaseTypes.forEach((type) => {
    const result = isStockDecreaseType(type);
    assert(
      result === false,
      `${type} should NOT be a decrease type`,
      false,
      result,
    );
  });
}

// ============================================================================
// Test isStockIncreaseType
// ============================================================================
function testIsStockIncreaseType() {
  testSection("isStockIncreaseType");

  // Test increase types
  const increaseTypes: TransactionType[] = [
    "PURCHASE",
    "TRANSFER_IN",
    "RETURN_SALE",
  ];

  increaseTypes.forEach((type) => {
    const result = isStockIncreaseType(type);
    assert(result === true, `${type} should be an increase type`, true, result);
  });

  // Test non-increase types
  const nonIncreaseTypes: TransactionType[] = [
    "SALE",
    "DAMAGE",
    "TRANSFER_OUT",
    "RETURN_PURCHASE",
    "STOCK_ADJUSTMENT",
  ];

  nonIncreaseTypes.forEach((type) => {
    const result = isStockIncreaseType(type);
    assert(
      result === false,
      `${type} should NOT be an increase type`,
      false,
      result,
    );
  });
}

// ============================================================================
// Integration Tests
// ============================================================================
function testIntegration() {
  testSection("Integration Tests");

  // Test 1: A type should be either increase or decrease (or neither for STOCK_ADJUSTMENT)
  const allTypes: TransactionType[] = [
    "SALE",
    "PURCHASE",
    "DAMAGE",
    "STOCK_ADJUSTMENT",
    "TRANSFER_IN",
    "TRANSFER_OUT",
    "RETURN_SALE",
    "RETURN_PURCHASE",
  ];

  allTypes.forEach((type) => {
    const isDecrease = isStockDecreaseType(type);
    const isIncrease = isStockIncreaseType(type);

    if (type === "STOCK_ADJUSTMENT") {
      assert(
        !isDecrease && !isIncrease,
        `STOCK_ADJUSTMENT should be neither increase nor decrease`,
        false,
        isDecrease || isIncrease,
      );
    } else {
      assert(
        (isDecrease && !isIncrease) || (!isDecrease && isIncrease),
        `${type} should be exactly one of: increase or decrease`,
        true,
        (isDecrease && !isIncrease) || (!isDecrease && isIncrease),
      );
    }
  });

  // Test 2: Stock change calculation consistency
  const result1 = calculateStockChange("SALE", 100);
  const result2 = calculateStockChange("PURCHASE", 100);
  assert(
    result1 + result2 === 0,
    "SALE and PURCHASE of same quantity should cancel out",
    0,
    result1 + result2,
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
    `${colors.blue}║  Stock Change Calculation Test Suite                      ║${colors.reset}`,
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`,
  );

  testCalculateStockChange();
  testIsStockDecreaseType();
  testIsStockIncreaseType();
  testIntegration();

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
