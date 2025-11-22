import {
  calculateNetPrice,
  calculateTaxAmount,
  calculateTotalWithTax,
} from "../../../src/server/business-logic/taxes/calculate-tax";

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

async function runAllTests() {
  console.log(
    `${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.blue}║  Tax Calculation Test Suite                               ║${colors.reset}`,
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`,
  );

  testSection("calculateTaxAmount");

  // Exclusive Tax Tests
  assert(
    calculateTaxAmount(100, 18, false) === 18,
    "Should calculate 18% exclusive tax on 100 correctly",
    18,
    calculateTaxAmount(100, 18, false),
  );
  assert(
    calculateTaxAmount(100, 10, false) === 10,
    "Should calculate 10% exclusive tax on 100 correctly",
  );
  assert(
    calculateTaxAmount(50, 20, false) === 10,
    "Should calculate 20% exclusive tax on 50 correctly",
  );
  assert(
    calculateTaxAmount(100, 0, false) === 0,
    "Should return 0 tax for 0% rate",
  );

  // Inclusive Tax Tests
  // 118 inclusive at 18% -> Net 100, Tax 18
  assert(
    calculateTaxAmount(118, 18, true) === 18,
    "Should calculate 18% inclusive tax on 118 correctly",
    18,
    calculateTaxAmount(118, 18, true),
  );
  // 110 inclusive at 10% -> Net 100, Tax 10
  assert(
    calculateTaxAmount(110, 10, true) === 10,
    "Should calculate 10% inclusive tax on 110 correctly",
  );

  // Rounding Tests
  // 100 inclusive at 18% -> 100 - (100/1.18) = 100 - 84.745... = 15.254... -> 15.25
  assert(
    calculateTaxAmount(100, 18, true) === 15.25,
    "Should handle rounding for inclusive tax correctly",
    15.25,
    calculateTaxAmount(100, 18, true),
  );

  testSection("calculateNetPrice");

  // Exclusive Tax (Net = Price)
  assert(
    calculateNetPrice(100, 18, false) === 100,
    "Should return original price as net for exclusive tax",
  );

  // Inclusive Tax (Net = Price / (1 + rate))
  assert(
    calculateNetPrice(118, 18, true) === 100,
    "Should calculate net price from 118 inclusive at 18%",
  );
  assert(
    calculateNetPrice(110, 10, true) === 100,
    "Should calculate net price from 110 inclusive at 10%",
  );

  // Rounding
  // 100 inclusive at 18% -> 100 / 1.18 = 84.745... -> 84.75
  assert(
    calculateNetPrice(100, 18, true) === 84.75,
    "Should handle rounding for net price calculation",
  );

  testSection("calculateTotalWithTax");

  // Exclusive Tax (Total = Price + Tax)
  assert(
    calculateTotalWithTax(100, 18, false) === 118,
    "Should add tax to price for exclusive tax",
  );

  // Inclusive Tax (Total = Price)
  assert(
    calculateTotalWithTax(118, 18, true) === 118,
    "Should return original price as total for inclusive tax",
  );

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

runAllTests().catch((error) => {
  console.error(
    `${colors.red}Test suite failed with error:${colors.reset}`,
    error,
  );
  process.exit(1);
});
