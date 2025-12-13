import type {
  ExtendedWarehouseItemPayload,
  SelectExpense,
  SelectProduct,
  SelectTransaction,
} from "@/lib/schema/schema.types";

type TransactionPayload = SelectTransaction & {
  product: SelectProduct;
};

function sumTransactionsAtCost(transactions: TransactionPayload[]): number {
  if (!Array.isArray(transactions)) return 0;

  return transactions.reduce((sum, t) => {
    if (!t || !t.product) return sum;

    const quantity = Math.abs(Number(t.quantity) || 0);
    const costPrice = parseFloat(t.product.costPrice) || 0;

    if (costPrice < 0) {
      console.warn(`Invalid transaction data: costPrice=${costPrice}`);
      return sum;
    }

    return sum + quantity * costPrice;
  }, 0);
}

function sumTransactionsAtSalePrice(
  transactions: TransactionPayload[]
): number {
  if (!Array.isArray(transactions)) return 0;

  return transactions.reduce((sum, t) => {
    if (!t || !t.product) return sum;

    const quantity = Math.abs(Number(t.quantity) || 0);
    const salePrice = parseFloat(t.product.price) || 0;

    if (salePrice < 0) {
      console.warn(`Invalid transaction data: salePrice=${salePrice}`);
      return sum;
    }

    return sum + quantity * salePrice;
  }, 0);
}

function sumExpenses(expenses: SelectExpense[]): number {
  if (!Array.isArray(expenses)) return 0;

  return expenses.reduce((sum, expense) => {
    if (!expense) return sum;

    const amount = parseFloat(expense.amount) || 0;

    if (amount < 0) {
      console.warn(`Invalid expense amount: ${amount}`);
      return sum;
    }

    return sum + amount;
  }, 0);
}

import {
  calculateNetPrice,
  calculateTaxAmount,
} from "../business-logic/taxes/calculate-tax";
import { roundCurrency, safeDivision } from "./math-helpers";

export function calculateAllMetrics(
  transactions: TransactionPayload[],
  expenses: SelectExpense[],
  openingStock: number,
  closingStock: number,
  taxRate: number = 0,
  pricesIncludeTax: boolean = false
) {
  if (!Array.isArray(transactions)) {
    console.error("Invalid transactions array provided");
    return getEmptyMetrics();
  }

  if (!Array.isArray(expenses)) {
    console.error("Invalid expenses array provided");
    return getEmptyMetrics();
  }

  const validOpeningStock = Math.max(0, Number(openingStock) || 0);
  const validClosingStock = Math.max(0, Number(closingStock) || 0);

  // Filter transactions by type
  const salesTransactions = transactions.filter((t) => t?.type === "SALE");
  const purchaseTransactions = transactions.filter(
    (t) => t?.type === "PURCHASE"
  );
  const salesReturnTransactions = transactions.filter(
    (t) => t?.type === "RETURN_SALE"
  );
  const purchaseReturnTransactions = transactions.filter(
    (t) => t?.type === "RETURN_PURCHASE"
  );

  // Revenue calculations
  const grossRevenue = sumTransactionsAtSalePrice(salesTransactions);
  const salesReturnsValue = sumTransactionsAtSalePrice(salesReturnTransactions);

  let netRevenue = 0;
  let taxCollected = 0;

  if (pricesIncludeTax) {
    // Inclusive: Gross has tax. Net = Gross - Tax
    const netSales = calculateNetPrice(grossRevenue, taxRate, true);
    const netReturns = calculateNetPrice(salesReturnsValue, taxRate, true);
    netRevenue = Math.max(0, netSales - netReturns);

    const taxOnSales = calculateTaxAmount(grossRevenue, taxRate, true);
    const taxOnReturns = calculateTaxAmount(salesReturnsValue, taxRate, true);
    taxCollected = Math.max(0, taxOnSales - taxOnReturns);
  } else {
    // Exclusive: Gross is Net. Tax is extra.
    // However, metrics usually track "Revenue" as the income to the business.
    // So Net Revenue is just (Sales - Returns) * Price.
    // Tax collected would be calculated on top of this.
    netRevenue = Math.max(0, grossRevenue - salesReturnsValue);

    // Calculate what the tax WOULD be (for reporting purposes)
    taxCollected = calculateTaxAmount(netRevenue, taxRate, false);
  }

  // Purchase calculations
  const grossPurchases = sumTransactionsAtCost(purchaseTransactions);
  const purchaseReturnsValue = sumTransactionsAtCost(
    purchaseReturnTransactions
  );
  const netPurchases = Math.max(0, grossPurchases - purchaseReturnsValue);

  // Cost calculations
  const costOfGoodsSold = sumTransactionsAtCost(salesTransactions);
  const grossProfit = netRevenue - costOfGoodsSold;

  // Operating calculations
  const operatingExpenses = sumExpenses(expenses);
  const operatingIncome = grossProfit - operatingExpenses;
  const netIncome = operatingIncome; // TODO: Add taxes and interest calculations

  // Margin calculations with safety checks
  const grossMargin =
    netRevenue > 0 ? safeDivision(grossProfit, netRevenue) * 100 : 0;
  const netMargin =
    netRevenue > 0 ? safeDivision(netIncome, netRevenue) * 100 : 0;
  const operatingMargin =
    netRevenue > 0 ? safeDivision(operatingIncome, netRevenue) * 100 : 0;

  // Inventory calculations
  const averageInventory = (validOpeningStock + validClosingStock) / 2;
  const inventoryTurnover =
    averageInventory > 0 ? safeDivision(costOfGoodsSold, averageInventory) : 0;
  const daysOnHand =
    inventoryTurnover > 0 ? Math.round(365 / inventoryTurnover) : 0;

  // Sales performance
  const transactionCount = salesTransactions.length;
  const averageOrderValue =
    transactionCount > 0 ? safeDivision(grossRevenue, transactionCount) : 0;

  // Advanced KPIs
  const returnRate =
    grossRevenue > 0 ? safeDivision(salesReturnsValue, grossRevenue) * 100 : 0;
  const purchaseReturnRate =
    grossPurchases > 0
      ? safeDivision(purchaseReturnsValue, grossPurchases) * 100
      : 0;

  // Cash flow indicators
  const workingCapital = validClosingStock; // TODO: Simplified, would need accounts receivable/payable for full calculation which aren't implemented yet, Apply it later
  const inventoryValue = validClosingStock;
  const inventoryGrowth =
    validOpeningStock > 0
      ? safeDivision(validClosingStock - validOpeningStock, validOpeningStock) *
        100
      : 0;

  // Efficiency ratios
  const assetTurnover =
    averageInventory > 0 ? safeDivision(netRevenue, averageInventory) : 0;
  const expenseRatio =
    netRevenue > 0 ? safeDivision(operatingExpenses, netRevenue) * 100 : 0;

  // Product performance
  const uniqueProductsSold = new Set(salesTransactions.map((t) => t.productId))
    .size;
  const averageQuantityPerTransaction =
    transactionCount > 0
      ? safeDivision(
          salesTransactions.reduce(
            (sum, t) => sum + (Math.abs(Number(t.quantity)) || 0),
            0
          ),
          transactionCount
        )
      : 0;

  return {
    // Core Revenue Metrics
    grossRevenue: roundCurrency(grossRevenue),
    netRevenue: roundCurrency(netRevenue),
    taxCollected: roundCurrency(taxCollected),
    returns: roundCurrency(salesReturnsValue),
    returnRate,

    // Sales Performance
    averageOrderValue,
    transactionCount,
    uniqueProductsSold,
    averageQuantityPerTransaction,

    // Inventory Metrics
    openingStock: validOpeningStock,
    closingStock: validClosingStock,
    purchases: roundCurrency(netPurchases),
    purchaseReturns: roundCurrency(purchaseReturnsValue),
    purchaseReturnRate,
    costOfGoodsSold: roundCurrency(costOfGoodsSold),
    averageInventory: roundCurrency(averageInventory),
    inventoryTurnover,
    daysOnHand,
    inventoryValue,
    inventoryGrowth,

    // Profitability Metrics
    grossProfit: roundCurrency(grossProfit),
    operatingIncome: roundCurrency(operatingIncome),
    netIncome: roundCurrency(netIncome),

    // Expense Metrics
    operatingExpenses: roundCurrency(operatingExpenses),
    expenseRatio,

    // Margin Analysis
    grossMargin,
    netMargin,
    operatingMargin,

    // Efficiency Ratios
    assetTurnover,
    workingCapital: roundCurrency(workingCapital),

    // Data Quality Indicators
    dataQuality: {
      totalTransactions: transactions.length,
      validTransactions:
        salesTransactions.length +
        purchaseTransactions.length +
        salesReturnTransactions.length +
        purchaseReturnTransactions.length,
      hasInventoryData: validOpeningStock > 0 || validClosingStock > 0,
      hasExpenseData: expenses.length > 0,
      calculationDate: new Date().toISOString(),
    },
  };
}

export function calculateClosingStock(
  warehouseItems: ExtendedWarehouseItemPayload[]
): number {
  return warehouseItems.reduce(
    (sum, w) => sum + w.quantity * parseFloat(w.product.costPrice),
    0
  );
}

/**
 * NOTE: COGS is calculated using transaction-based approach in calculateAllMetrics()
 * This provides more accurate per-transaction cost tracking vs period-based formula.
 * The traditional formula (Opening Stock + Purchases - Closing Stock) is not used here
 * as it can give different results than summing actual transaction costs.
 */

function getEmptyMetrics() {
  return {
    grossRevenue: 0,
    netRevenue: 0,
    returns: 0,
    returnRate: 0,
    averageOrderValue: 0,
    transactionCount: 0,
    uniqueProductsSold: 0,
    averageQuantityPerTransaction: 0,
    openingStock: 0,
    closingStock: 0,
    purchases: 0,
    purchaseReturns: 0,
    purchaseReturnRate: 0,
    costOfGoodsSold: 0,
    averageInventory: 0,
    inventoryTurnover: 0,
    daysOnHand: 0,
    inventoryValue: 0,
    inventoryGrowth: 0,
    grossProfit: 0,
    operatingIncome: 0,
    netIncome: 0,
    operatingExpenses: 0,
    expenseRatio: 0,
    grossMargin: 0,
    netMargin: 0,
    operatingMargin: 0,
    assetTurnover: 0,
    workingCapital: 0,
    dataQuality: {
      totalTransactions: 0,
      validTransactions: 0,
      hasInventoryData: false,
      hasExpenseData: false,
      calculationDate: new Date().toISOString(),
    },
  };
}
