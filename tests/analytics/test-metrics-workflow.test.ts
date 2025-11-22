/**
 * Executable Test Script for Metrics Workflow
 *
 * Run with: npx tsx src/__tests__/analytics/test-metrics-workflow.ts
 *
 * This script demonstrates the metrics calculation workflow using actual code.
 * Note: This is a demonstration script that simulates the workflow without database access.
 * For full integration testing with database, you would need to set up a test database.
 */

import { endOfMonth, startOfMonth, subMonths } from "date-fns";
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
} from "@/server/helpers/accounting-formulas";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

type MockTransaction = SelectTransaction & { product: SelectProduct };

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log(`\n${colors.cyan}━━━ ${title} ━━━${colors.reset}`);
}

function logStep(step: number, description: string) {
  console.log(`${colors.blue}Step ${step}:${colors.reset} ${description}`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logInfo(label: string, value: any) {
  console.log(
    `  ${colors.yellow}${label}:${colors.reset} ${JSON.stringify(value, null, 2)}`,
  );
}

// ============================================================================
// Mock Data Creation
// ============================================================================
function createMockProduct(
  overrides: Partial<SelectProduct> = {},
): SelectProduct {
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
    ...overrides,
  };
}

function createMockTransactions(month: Date): MockTransaction[] {
  const product1 = createMockProduct({ id: "prod-1", name: "Product A" });
  const product2 = createMockProduct({
    id: "prod-2",
    name: "Product B",
    price: "150.00",
    costPrice: "90.00",
  });

  return [
    {
      id: "trans-1",
      productId: "prod-1",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "SALE",
      quantity: -15,
      reference: "SALE-001",
      businessId: "biz-1",
      supplierId: null,
      note: null,
      createdAt: new Date(month.getFullYear(), month.getMonth(), 5),
      createdBy: "user-1",
      product: product1,
    },
    {
      id: "trans-2",
      productId: "prod-2",
      warehouseId: "wh-1",
      warehouseItemId: "whi-2",
      type: "SALE",
      quantity: -8,
      reference: "SALE-002",
      businessId: "biz-1",
      supplierId: null,
      note: null,
      createdAt: new Date(month.getFullYear(), month.getMonth(), 10),
      createdBy: "user-1",
      product: product2,
    },
    {
      id: "trans-3",
      productId: "prod-1",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "PURCHASE",
      quantity: 50,
      reference: "PUR-001",
      businessId: "biz-1",
      supplierId: "sup-1",
      note: null,
      createdAt: new Date(month.getFullYear(), month.getMonth(), 15),
      createdBy: "user-1",
      product: product1,
    },
    {
      id: "trans-4",
      productId: "prod-1",
      warehouseId: "wh-1",
      warehouseItemId: "whi-1",
      type: "RETURN_SALE",
      quantity: 2,
      reference: "RET-001",
      businessId: "biz-1",
      supplierId: null,
      note: null,
      createdAt: new Date(month.getFullYear(), month.getMonth(), 20),
      createdBy: "user-1",
      product: product1,
    },
  ];
}

function createMockExpenses(month: Date): SelectExpense[] {
  return [
    {
      id: "exp-1",
      amount: "1200.00",
      reference: "EXP-001",
      businessId: "biz-1",
      note: "Office rent",
      createdAt: new Date(month.getFullYear(), month.getMonth(), 1),
      createdBy: "user-1",
    },
    {
      id: "exp-2",
      amount: "500.00",
      reference: "EXP-002",
      businessId: "biz-1",
      note: "Utilities",
      createdAt: new Date(month.getFullYear(), month.getMonth(), 15),
      createdBy: "user-1",
    },
  ];
}

function createMockWarehouseItems(): ExtendedWarehouseItemPayload[] {
  const product1 = createMockProduct({ id: "prod-1", name: "Product A" });
  const product2 = createMockProduct({
    id: "prod-2",
    name: "Product B",
    costPrice: "90.00",
  });

  return [
    {
      id: "whi-1",
      productId: "prod-1",
      warehouseId: "wh-1",
      quantity: 35,
      lastUpdated: new Date(),
      product: product1,
      deletedAt: null,
      reservedQty: 0,
    },
    {
      id: "whi-2",
      productId: "prod-2",
      warehouseId: "wh-1",
      quantity: 12,
      lastUpdated: new Date(),
      product: product2,
      deletedAt: null,
      reservedQty: 0,
    },
  ];
}

// ============================================================================
// Workflow Simulation
// ============================================================================
function simulateMetricsWorkflow() {
  console.log(
    `${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.blue}║  Metrics Calculation Workflow Demonstration               ║${colors.reset}`,
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`,
  );

  // Setup test month (2 months ago)
  const testMonth = startOfMonth(subMonths(new Date(), 2));
  const testMonthEnd = endOfMonth(testMonth);

  log(
    `\n${colors.magenta}Testing metrics for: ${testMonth.toISOString().split("T")[0]}${colors.reset}`,
  );

  // ============================================================================
  logSection("Step 1: Fetch Transactions for Time Period");
  // ============================================================================
  logStep(1, "Fetching transactions from database (simulated)");

  const transactions = createMockTransactions(testMonth);
  logSuccess(`Fetched ${transactions.length} transactions`);
  logInfo("Transaction Summary", {
    sales: transactions.filter((t) => t.type === "SALE").length,
    purchases: transactions.filter((t) => t.type === "PURCHASE").length,
    returns: transactions.filter((t) => t.type === "RETURN_SALE").length,
  });

  // ============================================================================
  logSection("Step 2: Fetch Expenses for Time Period");
  // ============================================================================
  logStep(2, "Fetching expenses from database (simulated)");

  const expenses = createMockExpenses(testMonth);
  logSuccess(`Fetched ${expenses.length} expenses`);
  const totalExpenses = expenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0,
  );
  logInfo("Total Expenses", `$${totalExpenses.toFixed(2)}`);

  // ============================================================================
  logSection("Step 3: Calculate Opening Stock");
  // ============================================================================
  logStep(3, "Fetching previous month's closing stock (simulated)");

  // In real workflow, this would fetch from metrics table
  const openingStock = 5000; // Simulated previous month's closing stock
  logSuccess(`Opening stock value: $${openingStock.toFixed(2)}`);

  // ============================================================================
  logSection("Step 4: Calculate Closing Stock");
  // ============================================================================
  logStep(4, "Fetching current warehouse items and calculating closing stock");

  const warehouseItems = createMockWarehouseItems();
  const closingStock = calculateClosingStock(warehouseItems);
  logSuccess(`Closing stock calculated: $${closingStock.toFixed(2)}`);
  logInfo(
    "Warehouse Items",
    warehouseItems.map((w) => ({
      product: w.product.name,
      quantity: w.quantity,
      costPrice: w.product.costPrice,
      value: w.quantity * parseFloat(w.product.costPrice),
    })),
  );

  // ============================================================================
  logSection("Step 5: Calculate All Metrics");
  // ============================================================================
  logStep(5, "Running comprehensive metrics calculation");

  const metrics = calculateAllMetrics(
    transactions,
    expenses,
    openingStock,
    closingStock,
  );

  logSuccess("Metrics calculated successfully");

  // Display key metrics
  console.log(`\n${colors.yellow}Key Financial Metrics:${colors.reset}`);
  console.log(`  Revenue:`);
  console.log(`    Gross Revenue:        $${metrics.grossRevenue.toFixed(2)}`);
  console.log(`    Returns:              $${metrics.returns.toFixed(2)}`);
  console.log(`    Net Revenue:          $${metrics.netRevenue.toFixed(2)}`);

  console.log(`\n  Costs & Profitability:`);
  console.log(
    `    COGS:                 $${metrics.costOfGoodsSold.toFixed(2)}`,
  );
  console.log(`    Gross Profit:         $${metrics.grossProfit.toFixed(2)}`);
  console.log(
    `    Operating Expenses:   $${metrics.operatingExpenses.toFixed(2)}`,
  );
  console.log(
    `    Operating Income:     $${metrics.operatingIncome.toFixed(2)}`,
  );
  console.log(`    Net Income:           $${metrics.netIncome.toFixed(2)}`);

  console.log(`\n  Margins:`);
  console.log(`    Gross Margin:         ${metrics.grossMargin.toFixed(2)}%`);
  console.log(
    `    Operating Margin:     ${metrics.operatingMargin.toFixed(2)}%`,
  );
  console.log(`    Net Margin:           ${metrics.netMargin.toFixed(2)}%`);

  console.log(`\n  Inventory:`);
  console.log(`    Opening Stock:        $${metrics.openingStock.toFixed(2)}`);
  console.log(`    Purchases:            $${metrics.purchases.toFixed(2)}`);
  console.log(`    Closing Stock:        $${metrics.closingStock.toFixed(2)}`);
  console.log(
    `    Inventory Turnover:   ${metrics.inventoryTurnover.toFixed(2)}x`,
  );
  console.log(`    Days on Hand:         ${metrics.daysOnHand} days`);

  console.log(`\n  Sales Performance:`);
  console.log(`    Transaction Count:    ${metrics.transactionCount}`);
  console.log(`    Unique Products Sold: ${metrics.uniqueProductsSold}`);
  console.log(
    `    Average Order Value:  $${metrics.averageOrderValue.toFixed(2)}`,
  );
  console.log(`    Return Rate:          ${metrics.returnRate.toFixed(2)}%`);

  // ============================================================================
  logSection("Step 6: Sync Metrics to Database");
  // ============================================================================
  logStep(6, "Saving metrics to database (simulated)");

  // In real workflow, this would call syncMetricsToDatabase()
  const metricsToSync = Object.entries(metrics)
    .filter(([key]) => key !== "dataQuality")
    .map(([name, value]) => ({
      businessId: "biz-1",
      name,
      value: typeof value === "number" ? value.toString() : value,
      period: "monthly",
      periodDate: testMonth,
    }));

  logSuccess(`Would sync ${metricsToSync.length} metric records to database`);
  logInfo("Sample Metrics to Sync (first 5)", metricsToSync.slice(0, 5));

  // ============================================================================
  logSection("Step 7: Data Quality Validation");
  // ============================================================================
  logStep(7, "Validating data quality");

  console.log(`\n${colors.yellow}Data Quality Report:${colors.reset}`);
  console.log(
    `  Total Transactions:   ${metrics.dataQuality.totalTransactions}`,
  );
  console.log(
    `  Valid Transactions:   ${metrics.dataQuality.validTransactions}`,
  );
  console.log(
    `  Has Inventory Data:   ${metrics.dataQuality.hasInventoryData ? "✓" : "✗"}`,
  );
  console.log(
    `  Has Expense Data:     ${metrics.dataQuality.hasExpenseData ? "✓" : "✗"}`,
  );
  console.log(`  Calculation Date:     ${metrics.dataQuality.calculationDate}`);

  const dataQualityScore =
    (metrics.dataQuality.validTransactions /
      Math.max(1, metrics.dataQuality.totalTransactions)) *
      40 +
    (metrics.dataQuality.hasInventoryData ? 30 : 0) +
    (metrics.dataQuality.hasExpenseData ? 30 : 0);

  console.log(
    `\n  ${colors.green}Data Quality Score: ${dataQualityScore.toFixed(0)}%${colors.reset}`,
  );

  // ============================================================================
  logSection("Workflow Summary");
  // ============================================================================
  console.log(
    `\n${colors.green}✓ Workflow completed successfully!${colors.reset}`,
  );
  console.log(`\nThis workflow demonstrates:`);
  console.log(`  1. Fetching transactions for a specific time period`);
  console.log(`  2. Fetching expenses for the same period`);
  console.log(`  3. Calculating opening stock from previous period`);
  console.log(`  4. Calculating closing stock from current inventory`);
  console.log(`  5. Computing comprehensive financial metrics`);
  console.log(`  6. Syncing results to database for reporting`);
  console.log(`  7. Validating data quality`);

  console.log(
    `\n${colors.cyan}Note: This is a simulation using mock data.${colors.reset}`,
  );
  console.log(`For full integration testing, connect to a test database.`);
}

// ============================================================================
// Test getMonthlyMetrics workflow
// ============================================================================
function simulateGetMonthlyMetricsWorkflow() {
  logSection("getMonthlyMetrics Workflow");

  const testMonth = startOfMonth(subMonths(new Date(), 1));

  logStep(1, "Simulating retrieval of monthly metrics");
  log(`  Fetching metrics for: ${testMonth.toISOString().split("T")[0]}`);

  // In real workflow, this would query the metrics table
  const mockStoredMetrics = [
    { name: "grossRevenue", value: "2700.00" },
    { name: "netRevenue", value: "2500.00" },
    { name: "grossProfit", value: "1120.00" },
    { name: "netIncome", value: "-580.00" },
    { name: "transactionCount", value: "2" },
  ];

  logSuccess(
    `Retrieved ${mockStoredMetrics.length} metrics from database (simulated)`,
  );
  logInfo("Stored Metrics", mockStoredMetrics);
}

// ============================================================================
// Run all workflow demonstrations
// ============================================================================
function runAllWorkflows() {
  try {
    simulateMetricsWorkflow();
    console.log("\n");
    simulateGetMonthlyMetricsWorkflow();

    console.log(
      `\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`,
    );
    console.log(
      `${colors.green}✓ All workflow demonstrations completed successfully!${colors.reset}\n`,
    );
    process.exit(0);
  } catch (error) {
    console.error(
      `\n${colors.red}✗ Workflow demonstration failed:${colors.reset}`,
      error,
    );
    process.exit(1);
  }
}

// Run the workflows
runAllWorkflows();
