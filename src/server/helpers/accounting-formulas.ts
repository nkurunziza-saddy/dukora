import type { SelectTransaction } from "@/lib/schema/schema-types";

export function calculateAllMetrics(
  transactions: SelectTransaction[],
  openingStock: number
) {
  const salesTransactions = transactions.filter((t) => t.type === "SALE");
  const purchaseTransactions = transactions.filter(
    (t) => t.type === "PURCHASE"
  );
  const expenseTransactions = transactions.filter(
    (t) => t.type === "TRANSFER_OUT"
  );
  const returnTransactions = transactions.filter(
    (t) => t.type === "RETURN_SALE"
  );

  const grossRevenue = salesTransactions.reduce(
    (sum, t) => sum + t.quantity,
    0
  );
  const returns = returnTransactions.reduce(
    (sum, t) => sum + Math.abs(t.quantity),
    0
  );
  const netRevenue = grossRevenue - returns;

  const purchases = purchaseTransactions.reduce(
    (sum, t) => sum + Math.abs(t.quantity),
    0
  );
  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + Math.abs(t.quantity),
    0
  );

  const costOfGoodsSold = calculateCOGS(openingStock, purchases, 0);
  const closingStock = openingStock + purchases - costOfGoodsSold;
  const averageInventory = (openingStock + closingStock) / 2;
  const inventoryTurnover =
    averageInventory > 0 ? costOfGoodsSold / averageInventory : 0;
  const daysOnHand = inventoryTurnover > 0 ? 365 / inventoryTurnover : 0;

  const grossProfit = netRevenue - costOfGoodsSold;
  const operatingIncome = grossProfit - totalExpenses;
  const netIncome = operatingIncome;

  const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const netMargin = netRevenue > 0 ? (netIncome / netRevenue) * 100 : 0;
  const operatingMargin =
    netRevenue > 0 ? (operatingIncome / netRevenue) * 100 : 0;

  const transactionCount = salesTransactions.length;
  const averageOrderValue =
    transactionCount > 0 ? grossRevenue / transactionCount : 0;

  return {
    grossRevenue,
    netRevenue,
    returns,
    averageOrderValue,
    transactionCount,
    openingStock,
    closingStock,
    purchases,
    costOfGoodsSold,
    averageInventory,
    inventoryTurnover,
    daysOnHand,
    totalExpenses,
    operatingExpenses: totalExpenses,
    grossProfit,
    operatingIncome,
    netIncome,
    grossMargin,
    netMargin,
    operatingMargin,
    operatingCashFlow: netIncome + 5000,
    freeCashFlow: netIncome + 5000 - 10000,
  };
}

export function calculateCOGS(
  openingStock: number,
  purchases: number,
  closingStock: number
): number {
  return openingStock + purchases - closingStock;
}
