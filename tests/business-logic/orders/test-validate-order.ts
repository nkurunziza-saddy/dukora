/**
 * Test Suite for Order Validation Functions
 *
 * Run with: npx tsx src/__tests__/business-logic/orders/test-validate-order.ts
 *
 * Tests pure validation functions (no database/auth needed)
 */

import {
  type Address,
  type OrderItem,
  validateAddress,
  validateCustomerInfo,
  validateOrderId,
  validateOrderItems,
  validateOrderNumber,
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
// Test validateOrderItems
// ============================================================================
function testValidateOrderItems() {
  testSection("validateOrderItems");

  // Test 1: Valid items
  const validItems: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10.00" },
    { productId: "p2", quantity: 3, unitPrice: "5.00", discount: "1.00" },
  ];
  const result1 = validateOrderItems(validItems);
  assert(
    result1.valid === true && result1.error === null,
    "should pass with valid items",
  );

  // Test 2: Empty array
  const result2 = validateOrderItems([]);
  assert(
    result2.valid === false && result2.error === ErrorCode.MISSING_INPUT,
    "should fail with empty array",
  );

  // Test 3: Null input
  const result3 = validateOrderItems(null as any);
  assert(
    result3.valid === false && result3.error === ErrorCode.MISSING_INPUT,
    "should fail with null input",
  );

  // Test 4: Missing productId
  const items4: OrderItem[] = [
    { productId: "", quantity: 2, unitPrice: "10.00" },
  ];
  const result4 = validateOrderItems(items4);
  assert(
    result4.valid === false && result4.error === ErrorCode.MISSING_INPUT,
    "should fail with empty productId",
  );

  // Test 5: Invalid quantity (zero)
  const items5: OrderItem[] = [
    { productId: "p1", quantity: 0, unitPrice: "10.00" },
  ];
  const result5 = validateOrderItems(items5);
  assert(
    result5.valid === false && result5.error === ErrorCode.MISSING_INPUT,
    "should fail with zero quantity",
  );

  // Test 6: Invalid quantity (negative)
  const items6: OrderItem[] = [
    { productId: "p1", quantity: -5, unitPrice: "10.00" },
  ];
  const result6 = validateOrderItems(items6);
  assert(
    result6.valid === false && result6.error === ErrorCode.MISSING_INPUT,
    "should fail with negative quantity",
  );

  // Test 7: Missing unitPrice
  const items7: OrderItem[] = [{ productId: "p1", quantity: 2, unitPrice: "" }];
  const result7 = validateOrderItems(items7);
  assert(
    result7.valid === false && result7.error === ErrorCode.MISSING_INPUT,
    "should fail with empty unitPrice",
  );

  // Test 8: Invalid unitPrice (not a number)
  const items8: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "invalid" },
  ];
  const result8 = validateOrderItems(items8);
  assert(
    result8.valid === false && result8.error === ErrorCode.MISSING_INPUT,
    "should fail with invalid unitPrice",
  );

  // Test 9: Negative unitPrice
  const items9: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "-10" },
  ];
  const result9 = validateOrderItems(items9);
  assert(
    result9.valid === false && result9.error === ErrorCode.MISSING_INPUT,
    "should fail with negative unitPrice",
  );

  // Test 10: Invalid discount (not a number)
  const items10: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10", discount: "invalid" },
  ];
  const result10 = validateOrderItems(items10);
  assert(
    result10.valid === false && result10.error === ErrorCode.MISSING_INPUT,
    "should fail with invalid discount",
  );

  // Test 11: Negative discount
  const items11: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10", discount: "-5" },
  ];
  const result11 = validateOrderItems(items11);
  assert(
    result11.valid === false && result11.error === ErrorCode.MISSING_INPUT,
    "should fail with negative discount",
  );

  // Test 12: Valid discount
  const items12: OrderItem[] = [
    { productId: "p1", quantity: 2, unitPrice: "10", discount: "2" },
  ];
  const result12 = validateOrderItems(items12);
  assert(
    result12.valid === true && result12.error === null,
    "should pass with valid discount",
  );
}

// ============================================================================
// Test validateCustomerInfo
// ============================================================================
function testValidateCustomerInfo() {
  testSection("validateCustomerInfo");

  // Test 1: Valid info (no phone)
  const result1 = validateCustomerInfo("test@example.com", "John Doe");
  assert(
    result1.valid === true && result1.error === null,
    "should pass with valid email and name",
  );

  // Test 2: Valid info (with phone)
  const result2 = validateCustomerInfo(
    "test@example.com",
    "John Doe",
    "+1234567890",
  );
  assert(
    result2.valid === true && result2.error === null,
    "should pass with valid phone number",
  );

  // Test 3: Invalid email (empty)
  const result3 = validateCustomerInfo("", "John Doe");
  assert(
    result3.valid === false && result3.error === ErrorCode.MISSING_INPUT,
    "should fail with empty email",
  );

  // Test 4: Invalid email (bad format)
  const result4 = validateCustomerInfo("notanemail", "John Doe");
  assert(
    result4.valid === false && result4.error === ErrorCode.MISSING_INPUT,
    "should fail with invalid email format",
  );

  // Test 5: Invalid name (empty)
  const result5 = validateCustomerInfo("test@example.com", "");
  assert(
    result5.valid === false && result5.error === ErrorCode.MISSING_INPUT,
    "should fail with empty name",
  );

  // Test 6: Invalid phone (too short)
  const result6 = validateCustomerInfo("test@example.com", "John Doe", "123");
  assert(
    result6.valid === false && result6.error === ErrorCode.MISSING_INPUT,
    "should fail with invalid phone (too short)",
  );

  // Test 7: Valid phone with formatting
  const result7 = validateCustomerInfo(
    "test@example.com",
    "John Doe",
    "+1 (234) 567-8900",
  );
  assert(
    result7.valid === true && result7.error === null,
    "should pass with formatted phone number",
  );

  // Test 8: Empty phone string (should pass - optional field)
  const result8 = validateCustomerInfo("test@example.com", "John Doe", "");
  assert(
    result8.valid === true && result8.error === null,
    "should pass with empty phone string (optional)",
  );
}

// ============================================================================
// Test validateAddress
// ============================================================================
function testValidateAddress() {
  testSection("validateAddress");

  // Test 1: Valid address
  const validAddress: Address = {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
  };
  const result1 = validateAddress(validAddress);
  assert(
    result1.valid === true && result1.error === null,
    "should pass with valid address",
  );

  // Test 2: Null address
  const result2 = validateAddress(null as any);
  assert(
    result2.valid === false && result2.error === ErrorCode.MISSING_INPUT,
    "should fail with null address",
  );

  // Test 3: Missing street
  const address3: Address = {
    street: "",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
  };
  const result3 = validateAddress(address3);
  assert(
    result3.valid === false && result3.error === ErrorCode.MISSING_INPUT,
    "should fail with empty street",
  );

  // Test 4: Missing city
  const address4: Address = {
    street: "123 Main St",
    city: "",
    state: "NY",
    postalCode: "10001",
    country: "USA",
  };
  const result4 = validateAddress(address4);
  assert(
    result4.valid === false && result4.error === ErrorCode.MISSING_INPUT,
    "should fail with empty city",
  );

  // Test 5: Missing state
  const address5: Address = {
    street: "123 Main St",
    city: "New York",
    state: "",
    postalCode: "10001",
    country: "USA",
  };
  const result5 = validateAddress(address5);
  assert(
    result5.valid === false && result5.error === ErrorCode.MISSING_INPUT,
    "should fail with empty state",
  );

  // Test 6: Missing postalCode
  const address6: Address = {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "",
    country: "USA",
  };
  const result6 = validateAddress(address6);
  assert(
    result6.valid === false && result6.error === ErrorCode.MISSING_INPUT,
    "should fail with empty postalCode",
  );

  // Test 7: Missing country
  const address7: Address = {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "",
  };
  const result7 = validateAddress(address7);
  assert(
    result7.valid === false && result7.error === ErrorCode.MISSING_INPUT,
    "should fail with empty country",
  );
}

// ============================================================================
// Test validateOrderId
// ============================================================================
function testValidateOrderId() {
  testSection("validateOrderId");

  // Test 1: Valid ID
  const result1 = validateOrderId("order-123");
  assert(
    result1.valid === true && result1.error === null,
    "should pass with valid order ID",
  );

  // Test 2: Empty string
  const result2 = validateOrderId("");
  assert(
    result2.valid === false && result2.error === ErrorCode.MISSING_INPUT,
    "should fail with empty string",
  );

  // Test 3: Whitespace only
  const result3 = validateOrderId("   ");
  assert(
    result3.valid === false && result3.error === ErrorCode.MISSING_INPUT,
    "should fail with whitespace only",
  );
}

// ============================================================================
// Test validateOrderNumber
// ============================================================================
function testValidateOrderNumber() {
  testSection("validateOrderNumber");

  // Test 1: Valid order number
  const result1 = validateOrderNumber("ORD-12345");
  assert(
    result1.valid === true && result1.error === null,
    "should pass with valid order number",
  );

  // Test 2: Empty string
  const result2 = validateOrderNumber("");
  assert(
    result2.valid === false && result2.error === ErrorCode.MISSING_INPUT,
    "should fail with empty string",
  );

  // Test 3: Whitespace only
  const result3 = validateOrderNumber("   ");
  assert(
    result3.valid === false && result3.error === ErrorCode.MISSING_INPUT,
    "should fail with whitespace only",
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
    `${colors.blue}║  Order Validation Test Suite                              ║${colors.reset}`,
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`,
  );

  testValidateOrderItems();
  testValidateCustomerInfo();
  testValidateAddress();
  testValidateOrderId();
  testValidateOrderNumber();

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
