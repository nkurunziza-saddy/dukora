/**
 * Executable Test Script for Accounting Formulas
 *
 * Run with: npx tsx src/__tests__/analytics/test-accounting-formulas.ts
 *
 * This script tests accounting formulas using actual code (no mocks)
 */

import type {
  ExtendedWarehouseItemPayload,
  SelectExpense,
  SelectProduct,
  SelectTransaction,
} from "@/lib/schema/schema-types";
import { ProductStatus } from "@/lib/schema/schema-types";
import {
  calculateAllMetrics,
  calculateClosingStock,
  calculateCOGS,
} from "@/server/helpers/accounting-formulas";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

type MockTransaction = SelectTransaction & { product: SelectProduct };

let testsPassed = 0;
let testsFailed = 0;

function assert(
  condition: boolean,
  testName: string,
  expected?: any,
  actual?: any,
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

function createMockProduct(): SelectProduct {
  return {
    id: "prod-1",
    name: "Test Product",
    price: "100.00",
    costPrice: "60.00",
    sku: "TEST-001",
    description: "Test product description",
    businessId: "biz-1",
    createdAt: new Date(),
    status: ProductStatus.ACTIVE,
    updatedAt: new Date(),
    categoryId: "cat-1",
    barcode: "123456789",
    weight: "1",
    version: 1,
    unit: "kg",
    reorderPoint: 10,
    maxStock: 100,
    length: null,
    width: null,
    height: null,
    imageUrl: null,
    deletedAt: null,
  };
}

// ============================================================================
// Test calculateCOGS
// ============================================================================
function testCalculateCOGS() {
  testSection("calculateCOGS");

  // Test 1: Normal calculation
  const result1 = calculateCOGS(1000, 500, 800);
  assert(
    result1 === 700,
    "should calculate COGS correctly (1000 + 500 - 800 = 700)",
    700,
    result1,
  );

  // Test 2: Should not return negative COGS
  const result2 = calculateCOGS(100, 50, 200);
  assert(
    result2 === 0,
    "should not return negative COGS (max(0, 100 + 50 - 200) = 0)",
    0,
    result2,
  );

  // Test 3: Zero values
  const result3 = calculateCOGS(0, 0, 0);
  assert(result3 === 0, "should handle zero values", 0, result3);

  // Test 4: Negative inputs should be corrected to 0
  const result4 = calculateCOGS(-100, -50, -200);
  assert(result4 === 0, "should handle negative inputs", 0, result4);
}

// ============================================================================
// Test calculateClosingStock
// ============================================================================
function testCalculateClosingStock() {
  testSection("calculateClosingStock");

  const mockProduct = createMockProduct();

  // Test 1: Single warehouse item
  const warehouseItems1: ExtendedWarehouseItemPayload[] = [
    {
      id: "whi-1",
      productId: "prod-1",
      warehouseId: "wh-1",
      quantity: 10,
      lastUpdated: new Date(),
      product: mockProduct,
      deletedAt: null,
      reservedQty: 0,
    },
  ];

  const result1 = calculateClosingStock(warehouseItems1);
  assert(
    result1 === 600,
    "should calculate closing stock for single item (10 * 60 = 600)",
    600,
    result1,
  );

  // Test 2: Multiple warehouse items
  const warehouseItems2: ExtendedWarehouseItemPayload[] = [
    {
      id: "whi-1",
      productId: "prod-1",
      warehouseId: "wh-1",
      quantity: 10,
      lastUpdated: new Date(),
      product: mockProduct,
      deletedAt: null,
      reservedQty: 0,
    },
    {
      id: "whi-2",
      productId: "prod-1",
      warehouseId: "wh-2",
      quantity: 5,
      lastUpdated: new Date(),
      product: { ...mockProduct, costPrice: "80.00" },
      deletedAt: null,
      reservedQty: 0,
    },
  ];

  const result2 = calculateClosingStock(warehouseItems2);
  assert(
    result2 === 1000,
    "should calculate closing stock for multiple items (10*60 + 5*80 = 1000)",
    1000,
    result2,
  );

  // Test 3: Empty array
  const result3 = calculateClosingStock([]);
  assert(result3 === 0, "should handle empty array", 0, result3);
}

// ============================================================================
// Test calculateAllMetrics
// ============================================================================
function testCalculateAllMetrics() {
  testSection("calculateAllMetrics - Basic Calculations");

  const mockProduct = createMockProduct();

  const mockTransactions: MockTransaction[] = [
    {
      id: "trans-1",
      productId: "prod-1",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "SALE",
      quantity: -10,
      reference: "SALE-001",
      businessId: "biz-1",
      supplierId: null,
      note: null,
      createdAt: new Date(),
      createdBy: "user-1",
      product: mockProduct,
    },
    {
      id: "trans-2",
      productId: "prod-1",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "PURCHASE",
      quantity: 20,
      reference: "PUR-001",
      businessId: "biz-1",
      supplierId: "sup-1",
      note: null,
      createdAt: new Date(),
      createdBy: "user-1",
      product: mockProduct,
    },
  ];

  const mockExpenses: SelectExpense[] = [
    {
      id: "exp-1",
      amount: "500.00",
      reference: "EXP-001",
      businessId: "biz-1",
      note: "Office rent",
      createdAt: new Date(),
      createdBy: "user-1",
    },
  ];

  const result = calculateAllMetrics(mockTransactions, mockExpenses, 1000, 800);

  // Revenue metrics
  assert(
    result.grossRevenue === 1000,
    "grossRevenue should be 1000 (10 * 100)",
    1000,
    result.grossRevenue,
  );
  assert(
    result.netRevenue === 1000,
    "netRevenue should be 1000 (no returns)",
    1000,
    result.netRevenue,
  );

  // Purchase metrics
  assert(
    result.purchases === 1200,
    "purchases should be 1200 (20 * 60)",
    1200,
    result.purchases,
  );

  // Cost and profit metrics
  assert(
    result.costOfGoodsSold === 600,
    "COGS should be 600 (10 * 60)",
    600,
    result.costOfGoodsSold,
  );
  assert(
    result.grossProfit === 400,
    "grossProfit should be 400 (1000 - 600)",
    400,
    result.grossProfit,
  );
  assert(
    result.operatingExpenses === 500,
    "operatingExpenses should be 500",
    500,
    result.operatingExpenses,
  );
  assert(
    result.operatingIncome === -100,
    "operatingIncome should be -100 (400 - 500)",
    -100,
    result.operatingIncome,
  );
  assert(
    result.netIncome === -100,
    "netIncome should be -100",
    -100,
    result.netIncome,
  );

  // Margin metrics
  assert(
    result.grossMargin === 40,
    "grossMargin should be 40% ((400/1000)*100)",
    40,
    result.grossMargin,
  );
  assert(
    result.netMargin === -10,
    "netMargin should be -10% ((-100/1000)*100)",
    -10,
    result.netMargin,
  );
  assert(
    result.operatingMargin === -10,
    "operatingMargin should be -10%",
    -10,
    result.operatingMargin,
  );

  // Transaction metrics
  assert(
    result.transactionCount === 1,
    "transactionCount should be 1 (only sales)",
    1,
    result.transactionCount,
  );
  assert(
    result.averageOrderValue === 1000,
    "averageOrderValue should be 1000",
    1000,
    result.averageOrderValue,
  );
  assert(
    result.averageQuantityPerTransaction === 10,
    "averageQuantityPerTransaction should be 10",
    10,
    result.averageQuantityPerTransaction,
  );

  // Data quality
  assert(
    result.dataQuality.totalTransactions === 2,
    "totalTransactions should be 2",
    2,
    result.dataQuality.totalTransactions,
  );
  assert(
    result.dataQuality.validTransactions === 2,
    "validTransactions should be 2",
    2,
    result.dataQuality.validTransactions,
  );
  assert(
    result.dataQuality.hasInventoryData === true,
    "hasInventoryData should be true",
    true,
    result.dataQuality.hasInventoryData,
  );
  assert(
    result.dataQuality.hasExpenseData === true,
    "hasExpenseData should be true",
    true,
    result.dataQuality.hasExpenseData,
  );
}

function testCalculateAllMetricsReturns() {
  testSection("calculateAllMetrics - Returns Handling");

  const mockProduct = createMockProduct();

  const transactionsWithReturns: MockTransaction[] = [
    {
      id: "trans-1",
      productId: "prod-1",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "SALE",
      quantity: -10,
      reference: "SALE-001",
      businessId: "biz-1",
      supplierId: null,
      note: null,
      createdAt: new Date(),
      createdBy: "user-1",
      product: mockProduct,
    },
    {
      id: "trans-2",
      productId: "prod-1",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "RETURN_SALE",
      quantity: 2,
      reference: "RET-001",
      businessId: "biz-1",
      supplierId: null,
      note: null,
      createdAt: new Date(),
      createdBy: "user-1",
      product: mockProduct,
    },
  ];

  const result = calculateAllMetrics(transactionsWithReturns, [], 1000, 800);

  assert(
    result.grossRevenue === 1000,
    "grossRevenue should be 1000",
    1000,
    result.grossRevenue,
  );
  assert(
    result.returns === 200,
    "returns should be 200 (2 * 100)",
    200,
    result.returns,
  );
  assert(
    result.netRevenue === 800,
    "netRevenue should be 800 (1000 - 200)",
    800,
    result.netRevenue,
  );
  assert(
    result.returnRate === 20,
    "returnRate should be 20% ((200/1000)*100)",
    20,
    result.returnRate,
  );
}

function testCalculateAllMetricsInventory() {
  testSection("calculateAllMetrics - Inventory Metrics");

  const mockProduct = createMockProduct();

  const mockTransactions: MockTransaction[] = [
    {
      id: "trans-1",
      productId: "prod-1",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "SALE",
      quantity: -10,
      reference: "SALE-001",
      businessId: "biz-1",
      supplierId: null,
      note: null,
      createdAt: new Date(),
      createdBy: "user-1",
      product: mockProduct,
    },
  ];

  const result = calculateAllMetrics(mockTransactions, [], 1000, 800);

  assert(
    result.openingStock === 1000,
    "openingStock should be 1000",
    1000,
    result.openingStock,
  );
  assert(
    result.closingStock === 800,
    "closingStock should be 800",
    800,
    result.closingStock,
  );
  assert(
    result.averageInventory === 900,
    "averageInventory should be 900 ((1000+800)/2)",
    900,
    result.averageInventory,
  );
  assert(
    result.inventoryTurnover === 0.67,
    "inventoryTurnover should be 0.67 (600/900)",
    0.67,
    result.inventoryTurnover,
  );
  assert(
    result.inventoryGrowth === -20,
    "inventoryGrowth should be -20% (((800-1000)/1000)*100)",
    -20,
    result.inventoryGrowth,
  );
}

function testCalculateAllMetricsMultipleProducts() {
  testSection("calculateAllMetrics - Multiple Products");

  const mockProduct = createMockProduct();

  const multiProductTransactions: MockTransaction[] = [
    {
      id: "trans-1",
      productId: "prod-1",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "SALE",
      quantity: -10,
      reference: "SALE-001",
      businessId: "biz-1",
      supplierId: null,
      note: null,
      createdAt: new Date(),
      createdBy: "user-1",
      product: mockProduct,
    },
    {
      id: "trans-4",
      productId: "prod-2",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "SALE",
      quantity: -10,
      reference: "SALE-002",
      businessId: "biz-1",
      supplierId: null,
      note: null,
      createdAt: new Date(),
      createdBy: "user-1",
      product: { ...mockProduct, id: "prod-2", name: "Product 2" },
    },
  ];

  const mockExpenses: SelectExpense[] = [
    {
      id: "exp-1",
      amount: "500.00",
      reference: "EXP-001",
      businessId: "biz-1",
      note: "Office rent",
      createdAt: new Date(),
      createdBy: "user-1",
    },
  ];

  const result = calculateAllMetrics(
    multiProductTransactions,
    mockExpenses,
    1000,
    800,
  );

  assert(
    result.uniqueProductsSold === 2,
    "uniqueProductsSold should be 2",
    2,
    result.uniqueProductsSold,
  );
  assert(
    result.averageQuantityPerTransaction === 10,
    "averageQuantityPerTransaction should be 10",
    10,
    result.averageQuantityPerTransaction,
  );
  assert(
    result.grossRevenue === 2000,
    "grossRevenue should be 2000 (1000 + 1000)",
    2000,
    result.grossRevenue,
  );
  assert(
    result.netRevenue === 2000,
    "netRevenue should be 2000",
    2000,
    result.netRevenue,
  );
  assert(
    result.expenseRatio === 25,
    "expenseRatio should be 25% ((500/2000)*100)",
    25,
    result.expenseRatio,
  );
}

function testCalculateAllMetricsEdgeCases() {
  testSection("calculateAllMetrics - Edge Cases");

  // Test 1: Empty arrays
  const result1 = calculateAllMetrics([], [], 0, 0);
  assert(
    result1.grossRevenue === 0,
    "grossRevenue should be 0 with empty data",
    0,
    result1.grossRevenue,
  );
  assert(
    result1.netRevenue === 0,
    "netRevenue should be 0 with empty data",
    0,
    result1.netRevenue,
  );
  assert(
    result1.costOfGoodsSold === 0,
    "costOfGoodsSold should be 0 with empty data",
    0,
    result1.costOfGoodsSold,
  );
  assert(
    result1.operatingExpenses === 0,
    "operatingExpenses should be 0 with empty data",
    0,
    result1.operatingExpenses,
  );

  // Test 2: Invalid inputs (null)
  // @ts-expect-error - Testing invalid input
  const result2 = calculateAllMetrics(null, [], 1000, 800);
  assert(
    result2.grossRevenue === 0,
    "should handle null transactions",
    0,
    result2.grossRevenue,
  );
  assert(
    result2.dataQuality.totalTransactions === 0,
    "totalTransactions should be 0 with null input",
    0,
    result2.dataQuality.totalTransactions,
  );

  // Test 3: Invalid expenses
  const mockProduct = createMockProduct();
  const mockTransactions: MockTransaction[] = [
    {
      id: "trans-1",
      productId: "prod-1",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "SALE",
      quantity: -10,
      reference: "SALE-001",
      businessId: "biz-1",
      supplierId: null,
      note: null,
      createdAt: new Date(),
      createdBy: "user-1",
      product: mockProduct,
    },
  ];

  // @ts-expect-error - Testing invalid input
  const result3 = calculateAllMetrics(mockTransactions, null, 1000, 800);
  assert(
    result3.operatingExpenses === 0,
    "should handle null expenses",
    0,
    result3.operatingExpenses,
  );
  assert(
    result3.dataQuality.hasExpenseData === false,
    "hasExpenseData should be false with null expenses",
    false,
    result3.dataQuality.hasExpenseData,
  );

  // Test 4: Negative stock values
  const result4 = calculateAllMetrics(mockTransactions, [], -100, -50);
  assert(
    result4.openingStock === 0,
    "should correct negative opening stock to 0",
    0,
    result4.openingStock,
  );
  assert(
    result4.closingStock === 0,
    "should correct negative closing stock to 0",
    0,
    result4.closingStock,
  );
}

// ============================================================================
// Run all tests
// ============================================================================
function runAllTests() {
  console.log(
    `${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.blue}║  Accounting Formulas Test Suite                           ║${colors.reset}`,
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`,
  );

  testCalculateCOGS();
  testCalculateClosingStock();
  testCalculateAllMetrics();
  testCalculateAllMetricsReturns();
  testCalculateAllMetricsInventory();
  testCalculateAllMetricsMultipleProducts();
  testCalculateAllMetricsEdgeCases();

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
runAllTests();
