import type {
  ExtendedWarehouseItemPayload,
  SelectExpense,
  SelectProduct,
  SelectTransaction,
} from "@/lib/schema/schema-types";

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
  transactions: TransactionPayload[],
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

export function calculateAllMetrics(
  transactions: TransactionPayload[],
  expenses: SelectExpense[],
  openingStock: number,
  closingStock: number,
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
    (t) => t?.type === "PURCHASE",
  );
  const salesReturnTransactions = transactions.filter(
    (t) => t?.type === "RETURN_SALE",
  );
  const purchaseReturnTransactions = transactions.filter(
    (t) => t?.type === "RETURN_PURCHASE",
  );

  // Revenue calculations
  const grossRevenue = sumTransactionsAtSalePrice(salesTransactions);
  const salesReturnsValue = sumTransactionsAtSalePrice(salesReturnTransactions);
  const netRevenue = Math.max(0, grossRevenue - salesReturnsValue);

  // Purchase calculations
  const grossPurchases = sumTransactionsAtCost(purchaseTransactions);
  const purchaseReturnsValue = sumTransactionsAtCost(
    purchaseReturnTransactions,
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
    netRevenue > 0 ? Number(((grossProfit / netRevenue) * 100).toFixed(2)) : 0;
  const netMargin =
    netRevenue > 0 ? Number(((netIncome / netRevenue) * 100).toFixed(2)) : 0;
  const operatingMargin =
    netRevenue > 0
      ? Number(((operatingIncome / netRevenue) * 100).toFixed(2))
      : 0;

  // Inventory calculations
  const averageInventory = (validOpeningStock + validClosingStock) / 2;
  const inventoryTurnover =
    averageInventory > 0
      ? Number((costOfGoodsSold / averageInventory).toFixed(2))
      : 0;
  const daysOnHand =
    inventoryTurnover > 0 ? Number((365 / inventoryTurnover).toFixed(0)) : 0;

  // Sales performance
  const transactionCount = salesTransactions.length;
  const averageOrderValue =
    transactionCount > 0
      ? Number((grossRevenue / transactionCount).toFixed(2))
      : 0;

  // Advanced KPIs
  const returnRate =
    grossRevenue > 0
      ? Number(((salesReturnsValue / grossRevenue) * 100).toFixed(2))
      : 0;
  const purchaseReturnRate =
    grossPurchases > 0
      ? Number(((purchaseReturnsValue / grossPurchases) * 100).toFixed(2))
      : 0;

  // Cash flow indicators
  const workingCapital = validClosingStock; // Simplified --- would need accounts receivable/payable for full calculation which arent't implemented yet, //TODO; Apply it later
  const inventoryValue = validClosingStock;
  const inventoryGrowth =
    validOpeningStock > 0
      ? Number(
          (
            ((validClosingStock - validOpeningStock) / validOpeningStock) *
            100
          ).toFixed(2),
        )
      : 0;

  // Efficiency ratios
  const assetTurnover =
    averageInventory > 0
      ? Number((netRevenue / averageInventory).toFixed(2))
      : 0;
  const expenseRatio =
    netRevenue > 0
      ? Number(((operatingExpenses / netRevenue) * 100).toFixed(2))
      : 0;

  // Product performance
  const uniqueProductsSold = new Set(salesTransactions.map((t) => t.productId))
    .size;
  const averageQuantityPerTransaction =
    transactionCount > 0
      ? Number(
          (
            salesTransactions.reduce(
              (sum, t) => sum + (Math.abs(Number(t.quantity)) || 0),
              0,
            ) / transactionCount
          ).toFixed(2),
        )
      : 0;

  return {
    // Core Revenue Metrics
    grossRevenue: Number(grossRevenue.toFixed(2)),
    netRevenue: Number(netRevenue.toFixed(2)),
    returns: Number(salesReturnsValue.toFixed(2)),
    returnRate,

    // Sales Performance
    averageOrderValue,
    transactionCount,
    uniqueProductsSold,
    averageQuantityPerTransaction,

    // Inventory Metrics
    openingStock: validOpeningStock,
    closingStock: validClosingStock,
    purchases: Number(netPurchases.toFixed(2)),
    purchaseReturns: Number(purchaseReturnsValue.toFixed(2)),
    purchaseReturnRate,
    costOfGoodsSold: Number(costOfGoodsSold.toFixed(2)),
    averageInventory: Number(averageInventory.toFixed(2)),
    inventoryTurnover,
    daysOnHand,
    inventoryValue,
    inventoryGrowth,

    // Profitability Metrics
    grossProfit: Number(grossProfit.toFixed(2)),
    operatingIncome: Number(operatingIncome.toFixed(2)),
    netIncome: Number(netIncome.toFixed(2)),

    // Expense Metrics
    operatingExpenses: Number(operatingExpenses.toFixed(2)),
    expenseRatio,

    // Margin Analysis
    grossMargin,
    netMargin,
    operatingMargin,

    // Efficiency Ratios
    assetTurnover,
    workingCapital: Number(workingCapital.toFixed(2)),

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
  warehouseItems: ExtendedWarehouseItemPayload[],
): number {
  return warehouseItems.reduce(
    (sum, w) => sum + w.quantity * parseFloat(w.product.costPrice),
    0,
  );
}

export function calculateCOGS(
  openingStock: number,
  purchases: number,
  closingStock: number,
): number {
  const validOpeningStock = Math.max(0, Number(openingStock) || 0);
  const validPurchases = Math.max(0, Number(purchases) || 0);
  const validClosingStock = Math.max(0, Number(closingStock) || 0);

  const cogs = validOpeningStock + validPurchases - validClosingStock;
  return Math.max(0, cogs);
}

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
