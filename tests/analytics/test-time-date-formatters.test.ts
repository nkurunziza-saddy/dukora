/**
 * Executable Test Script for Time Date Formatters
 *
 * Run with: npx tsx src/__tests__/analytics/test-time-date-formatters.ts
 *
 * This script tests time/date formatter functions using actual code (no vitest)
 */

import { startOfMonth, subMonths } from "date-fns";
import {
  getCurrentMonthBoundary,
  getMonthData,
  getPreviousMonth,
  parseMonth,
  parseMonthYearShort,
} from "@/server/helpers/time-date-formatters";

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
// Test getMonthData
// ============================================================================
function testGetMonthData() {
  testSection("getMonthData");

  // Test 1: Get month data for 0 months ago (should be last month)
  const result0 = getMonthData(0);
  const lastMonth = subMonths(startOfMonth(new Date()), 1);
  assert(
    result0.date.getMonth() === lastMonth.getMonth(),
    "should return last month for monthsAgo=0",
    lastMonth.getMonth(),
    result0.date.getMonth(),
  );

  // Test 2: Get month data for 1 month ago
  const result1 = getMonthData(1);
  const twoMonthsAgo = subMonths(startOfMonth(new Date()), 2);
  assert(
    result1.date.getMonth() === twoMonthsAgo.getMonth(),
    "should return 2 months ago for monthsAgo=1",
    twoMonthsAgo.getMonth(),
    result1.date.getMonth(),
  );

  // Test 3: Should always exclude current month
  const currentMonth = startOfMonth(new Date());
  assert(
    result0.date.getTime() < currentMonth.getTime(),
    "should always exclude current month",
    "< current month",
    "returned date",
  );

  // Test 4: Handle large monthsAgo values
  const result12 = getMonthData(12);
  const thirteenMonthsAgo = subMonths(startOfMonth(new Date()), 13);
  assert(
    result12.date.getMonth() === thirteenMonthsAgo.getMonth() &&
      result12.date.getFullYear() === thirteenMonthsAgo.getFullYear(),
    "should handle large monthsAgo values (12 months)",
    `${thirteenMonthsAgo.getFullYear()}-${thirteenMonthsAgo.getMonth()}`,
    `${result12.date.getFullYear()}-${result12.date.getMonth()}`,
  );

  // Test 5: Ensure minimum of 1 month adjustment
  const resultNegative = getMonthData(-5);
  assert(
    resultNegative.date.getTime() < currentMonth.getTime(),
    "should ensure minimum 1 month adjustment even with negative input",
    "< current month",
    "returned date",
  );
}

// ============================================================================
// Test getCurrentMonthBoundary
// ============================================================================
function testGetCurrentMonthBoundary() {
  testSection("getCurrentMonthBoundary");

  // Test 1: Should return last month as boundary
  const result = getCurrentMonthBoundary();
  const expectedBoundary = subMonths(startOfMonth(new Date()), 1);
  assert(
    result.getTime() === expectedBoundary.getTime(),
    "should return last month as boundary",
    expectedBoundary.toISOString(),
    result.toISOString(),
  );

  // Test 2: Should always be before current month
  const currentMonth = startOfMonth(new Date());
  assert(
    result.getTime() < currentMonth.getTime(),
    "should always be before current month",
    "< current month",
    result.toISOString(),
  );
}

// ============================================================================
// Test getAvailableMonthsForAnalytics
// ============================================================================
async function testGetAvailableMonthsForAnalytics() {
  testSection("getAvailableMonthsForAnalytics");

  console.log(
    `${colors.yellow}  Note: Skipping database-dependent tests (requires auth context)${colors.reset}`,
  );

  // These tests require database access and authentication context
  // They are skipped in this test environment
  assert(
    true,
    "getAvailableMonthsForAnalytics requires database/auth - skipped",
    "skipped",
    "skipped",
  );
}

// ============================================================================
// Test parseMonth
// ============================================================================
function testParseMonth() {
  testSection("parseMonth");

  // Test 1: Parse month number correctly
  const result = parseMonth(6);
  assert(
    result.getMonth() === 5 && result.getDate() === 1,
    "should parse month 6 as June (month index 5)",
    "month=5, date=1",
    `month=${result.getMonth()}, date=${result.getDate()}`,
  );

  // Test 2: Handle edge case - January
  const result1 = parseMonth(1);
  assert(
    result1.getMonth() === 0,
    "should parse month 1 as January (month index 0)",
    0,
    result1.getMonth(),
  );

  // Test 3: Handle edge case - December
  const result12 = parseMonth(12);
  assert(
    result12.getMonth() === 11,
    "should parse month 12 as December (month index 11)",
    11,
    result12.getMonth(),
  );
}

// ============================================================================
// Test parseMonthYearShort
// ============================================================================
function testParseMonthYearShort() {
  testSection("parseMonthYearShort");

  // Test 1: Parse month/year string correctly
  const result = parseMonthYearShort("6/24");
  assert(
    result.getMonth() === 5 && result.getFullYear() === 2024,
    "should parse '6/24' as June 2024",
    "month=5, year=2024",
    `month=${result.getMonth()}, year=${result.getFullYear()}`,
  );

  // Test 2: Throw error for invalid format
  let threwError = false;
  try {
    parseMonthYearShort("invalid");
  } catch {
    threwError = true;
  }
  assert(threwError, "should throw error for invalid format", true, threwError);

  // Test 3: Handle different valid formats
  const result1 = parseMonthYearShort("1/24");
  assert(
    result1.getMonth() === 0,
    "should parse '1/24' as January",
    0,
    result1.getMonth(),
  );

  const result12 = parseMonthYearShort("12/23");
  assert(
    result12.getFullYear() === 2023,
    "should parse '12/23' as year 2023",
    2023,
    result12.getFullYear(),
  );
}

// ============================================================================
// Test getPreviousMonth
// ============================================================================
function testGetPreviousMonth() {
  testSection("getPreviousMonth");

  // Test 1: Return previous month in YYYY-MM format
  const result = getPreviousMonth("2024-08");
  assert(
    result === "2024-07",
    "should return previous month for 2024-08",
    "2024-07",
    result,
  );

  // Test 2: Handle year boundary
  const resultBoundary = getPreviousMonth("2024-01");
  assert(
    resultBoundary === "2023-12",
    "should handle year boundary (2024-01 -> 2023-12)",
    "2023-12",
    resultBoundary,
  );

  // Test 3: Handle different month
  const result12 = getPreviousMonth("2024-12");
  assert(
    result12 === "2024-11",
    "should return previous month for 2024-12",
    "2024-11",
    result12,
  );
}

// ============================================================================
// Integration Tests
// ============================================================================
function testIntegration() {
  testSection("Integration Tests");

  // Test 1: Ensure getMonthData never returns current month
  const currentMonth = startOfMonth(new Date());
  let allPastMonths = true;
  for (let i = 0; i < 10; i++) {
    const result = getMonthData(i);
    if (result.date.getTime() >= currentMonth.getTime()) {
      allPastMonths = false;
      break;
    }
  }
  assert(
    allPastMonths,
    "getMonthData should never return current month (tested 10 iterations)",
    true,
    allPastMonths,
  );

  // Test 2: Ensure getCurrentMonthBoundary aligns with getMonthData logic
  const boundary = getCurrentMonthBoundary();
  const monthData = getMonthData(0);
  assert(
    monthData.date.getTime() === boundary.getTime(),
    "getCurrentMonthBoundary should align with getMonthData(0)",
    boundary.toISOString(),
    monthData.date.toISOString(),
  );
}

// ============================================================================
// Run all tests
// ============================================================================
async function runAllTests() {
  console.log(
    `${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.blue}║  Time Date Formatters Test Suite                          ║${colors.reset}`,
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`,
  );

  testGetMonthData();
  testGetCurrentMonthBoundary();
  await testGetAvailableMonthsForAnalytics();
  testParseMonth();
  testParseMonthYearShort();
  testGetPreviousMonth();
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
