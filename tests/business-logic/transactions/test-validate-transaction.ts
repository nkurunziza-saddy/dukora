/**
 * Test Suite for Transaction Validation Functions
 *
 * Run with: npx tsx src/__tests__/business-logic/transactions/test-validate-transaction.ts
 *
 * Tests pure validation functions (no database/auth needed)
 */

import {
  validateTransactionData,
  validateTransactionDataWithoutWarehouse,
  validateTransactionId,
  validateTransactionType,
} from "@/server/business-logic/transactions";
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
// Test validateTransactionData
// ============================================================================
function testValidateTransactionData() {
  testSection("validateTransactionData");

  // Test 1: Valid data
  const result1 = validateTransactionData({
    productId: "prod-123",
    warehouseItemId: "wh-456",
    type: "PURCHASE",
    quantity: 10,
    warehouseId: "warehouse-1",
  });
  assert(
    result1.valid === true && result1.error === null,
    "should pass with valid data",
    { valid: true, error: null },
    result1,
  );

  // Test 2: Missing productId
  const result2 = validateTransactionData({
    productId: "",
    warehouseItemId: "wh-456",
    type: "PURCHASE",
    quantity: 10,
    warehouseId: "warehouse-1",
  });
  assert(
    result2.valid === false && result2.error === ErrorCode.MISSING_INPUT,
    "should fail with empty productId",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result2,
  );

  // Test 3: Missing warehouseItemId
  const result3 = validateTransactionData({
    productId: "prod-123",
    warehouseItemId: "",
    type: "PURCHASE",
    quantity: 10,
    warehouseId: "warehouse-1",
  });
  assert(
    result3.valid === false && result3.error === ErrorCode.MISSING_INPUT,
    "should fail with empty warehouseItemId",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result3,
  );

  // Test 4: Missing type
  const result4 = validateTransactionData({
    productId: "prod-123",
    warehouseItemId: "wh-456",
    // @ts-expect-error - Testing missing type
    type: null,
    quantity: 10,
    warehouseId: "warehouse-1",
  });
  assert(
    result4.valid === false && result4.error === ErrorCode.MISSING_INPUT,
    "should fail with null type",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result4,
  );

  // Test 5: Invalid quantity (not a number)
  const result5 = validateTransactionData({
    productId: "prod-123",
    warehouseItemId: "wh-456",
    type: "PURCHASE",
    // @ts-expect-error - Testing invalid quantity
    quantity: "10",
    warehouseId: "warehouse-1",
  });
  assert(
    result5.valid === false && result5.error === ErrorCode.MISSING_INPUT,
    "should fail with quantity as string",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result5,
  );

  // Test 6: Zero quantity
  const result6 = validateTransactionData({
    productId: "prod-123",
    warehouseItemId: "wh-456",
    type: "PURCHASE",
    quantity: 0,
    warehouseId: "warehouse-1",
  });
  assert(
    result6.valid === false && result6.error === ErrorCode.MISSING_INPUT,
    "should fail with zero quantity",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result6,
  );

  // Test 7: Negative quantity
  const result7 = validateTransactionData({
    productId: "prod-123",
    warehouseItemId: "wh-456",
    type: "PURCHASE",
    quantity: -5,
    warehouseId: "warehouse-1",
  });
  assert(
    result7.valid === false && result7.error === ErrorCode.MISSING_INPUT,
    "should fail with negative quantity",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result7,
  );
}

// ============================================================================
// Test validateTransactionDataWithoutWarehouse
// ============================================================================
function testValidateTransactionDataWithoutWarehouse() {
  testSection("validateTransactionDataWithoutWarehouse");

  // Test 1: Valid data (no warehouseItemId needed)
  const result1 = validateTransactionDataWithoutWarehouse({
    productId: "prod-123",
    type: "PURCHASE",
    quantity: 10,
    warehouseId: "warehouse-1",
  });
  assert(
    result1.valid === true && result1.error === null,
    "should pass with valid data without warehouseItemId",
    { valid: true, error: null },
    result1,
  );

  // Test 2: Missing productId
  const result2 = validateTransactionDataWithoutWarehouse({
    productId: "",
    type: "PURCHASE",
    quantity: 10,
    warehouseId: "warehouse-1",
  });
  assert(
    result2.valid === false && result2.error === ErrorCode.MISSING_INPUT,
    "should fail with empty productId",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result2,
  );

  // Test 3: Missing type
  const result3 = validateTransactionDataWithoutWarehouse({
    productId: "prod-123",
    // @ts-expect-error - Testing missing type
    type: undefined,
    quantity: 10,
    warehouseId: "warehouse-1",
  });
  assert(
    result3.valid === false && result3.error === ErrorCode.MISSING_INPUT,
    "should fail with undefined type",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result3,
  );

  // Test 4: Invalid quantity
  const result4 = validateTransactionDataWithoutWarehouse({
    productId: "prod-123",
    type: "PURCHASE",
    quantity: 0,
    warehouseId: "warehouse-1",
  });
  assert(
    result4.valid === false && result4.error === ErrorCode.MISSING_INPUT,
    "should fail with zero quantity",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result4,
  );
}

// ============================================================================
// Test validateTransactionId
// ============================================================================
function testValidateTransactionId() {
  testSection("validateTransactionId");

  // Test 1: Valid ID
  const result1 = validateTransactionId("trans-123");
  assert(
    result1.valid === true && result1.error === null,
    "should pass with valid transaction ID",
    { valid: true, error: null },
    result1,
  );

  // Test 2: Empty string
  const result2 = validateTransactionId("");
  assert(
    result2.valid === false && result2.error === ErrorCode.MISSING_INPUT,
    "should fail with empty string",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result2,
  );

  // Test 3: Whitespace only
  const result3 = validateTransactionId("   ");
  assert(
    result3.valid === false && result3.error === ErrorCode.MISSING_INPUT,
    "should fail with whitespace only",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result3,
  );
}

// ============================================================================
// Test validateTransactionType
// ============================================================================
function testValidateTransactionType() {
  testSection("validateTransactionType");

  // Test all valid types
  const validTypes = [
    "SALE",
    "PURCHASE",
    "DAMAGE",
    "STOCK_ADJUSTMENT",
    "TRANSFER_IN",
    "TRANSFER_OUT",
    "RETURN_SALE",
    "RETURN_PURCHASE",
  ];

  validTypes.forEach((type) => {
    const result = validateTransactionType(type as any);
    assert(
      result.valid === true && result.error === null,
      `should pass with type: ${type}`,
      { valid: true, error: null },
      result,
    );
  });

  // Test invalid type
  const result1 = validateTransactionType("INVALID_TYPE" as any);
  assert(
    result1.valid === false && result1.error === ErrorCode.MISSING_INPUT,
    "should fail with invalid type",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result1,
  );

  // Test null type
  const result2 = validateTransactionType(null);
  assert(
    result2.valid === false && result2.error === ErrorCode.MISSING_INPUT,
    "should fail with null type",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result2,
  );

  // Test undefined type
  const result3 = validateTransactionType(undefined);
  assert(
    result3.valid === false && result3.error === ErrorCode.MISSING_INPUT,
    "should fail with undefined type",
    { valid: false, error: ErrorCode.MISSING_INPUT },
    result3,
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
    `${colors.blue}║  Transaction Validation Test Suite                        ║${colors.reset}`,
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`,
  );

  testValidateTransactionData();
  testValidateTransactionDataWithoutWarehouse();
  testValidateTransactionId();
  testValidateTransactionType();

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
