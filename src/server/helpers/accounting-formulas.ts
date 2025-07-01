import {
  ExtendedWarehouseItemPayload,
  SelectExpense,
  SelectProduct,
  SelectTransaction,
} from "@/lib/schema/schema-types";

type TransactionPayload = SelectTransaction & {
  product: SelectProduct;
};

function sumTransactionsAtCost(transactions: TransactionPayload[]): number {
  return transactions.reduce(
    (sum, t) => sum + t.quantity * parseFloat(t.product.costPrice),
    0
  );
}

function sumTransactionsAtSalePrice(
  transactions: TransactionPayload[]
): number {
  return transactions.reduce(
    (sum, t) => sum + t.quantity * parseFloat(t.product.price),
    0
  );
}

function sumExpenses(transactions: SelectExpense[]): number {
  return transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
}

export function calculateAllMetrics(
  transactions: TransactionPayload[],
  expenses: SelectExpense[],
  openingStock: number,
  closingStock: number
) {
  const salesTransactions = transactions.filter((t) => t.type === "SALE");
  const purchaseTransactions = transactions.filter(
    (t) => t.type === "PURCHASE"
  );
  const salesReturnTransactions = transactions.filter(
    (t) => t.type === "RETURN_SALE"
  );
  const purchaseReturnTransactions = transactions.filter(
    (t) => t.type === "RETURN_PURCHASE"
  );

  const grossRevenue = sumTransactionsAtSalePrice(salesTransactions);
  const salesReturnsValue = sumTransactionsAtSalePrice(salesReturnTransactions);
  const netRevenue = grossRevenue - salesReturnsValue;

  const grossPurchases = sumTransactionsAtCost(purchaseTransactions);
  const purchaseReturnsValue = sumTransactionsAtCost(
    purchaseReturnTransactions
  );
  const netPurchases = grossPurchases - purchaseReturnsValue;

  const costOfGoodsSold = calculateCOGS(
    openingStock,
    netPurchases,
    closingStock
  );

  const grossProfit = netRevenue - costOfGoodsSold;

  const operatingExpenses = sumExpenses(expenses);
  const operatingIncome = grossProfit - operatingExpenses;
  const netIncome = operatingIncome; // todo: no taxes or interest assumed

  const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const netMargin = netRevenue > 0 ? (netIncome / netRevenue) * 100 : 0;
  const operatingMargin =
    netRevenue > 0 ? (operatingIncome / netRevenue) * 100 : 0;

  const averageInventory = (openingStock + closingStock) / 2;
  const inventoryTurnover =
    averageInventory > 0 ? costOfGoodsSold / averageInventory : 0;
  const daysOnHand = inventoryTurnover > 0 ? 365 / inventoryTurnover : 0;
  const transactionCount = salesTransactions.length;
  const averageOrderValue =
    transactionCount > 0 ? grossRevenue / transactionCount : 0;

  return {
    grossRevenue,
    netRevenue,
    returns: salesReturnsValue,
    averageOrderValue,
    transactionCount,
    openingStock,
    closingStock,
    purchases: netPurchases,
    costOfGoodsSold,
    averageInventory,
    inventoryTurnover,
    daysOnHand,
    operatingExpenses,
    grossProfit,
    operatingIncome,
    netIncome,
    grossMargin,
    netMargin,
    operatingMargin,
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

export function calculateCOGS(
  openingStock: number,
  purchases: number,
  closingStock: number
): number {
  return openingStock + purchases - closingStock;
}
