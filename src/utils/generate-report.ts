/* eslint-disable @typescript-eslint/no-explicit-any */
export function generateCSVReport(metrics: any) {
  const csvData = [
    ["Metric", "Value"],
    ["Gross Revenue", `$${metrics.grossRevenue?.toLocaleString() || "0"}`],
    ["Net Revenue", `$${metrics.netRevenue?.toLocaleString() || "0"}`],
    ["Opening Stock", `$${metrics.openingStock?.toLocaleString() || "0"}`],
    ["Closing Stock", `$${metrics.closingStock?.toLocaleString() || "0"}`],
    ["Inventory Turnover", `${metrics.inventoryTurnover?.toFixed(2) || "0"}x`],
    ["Days on Hand", `${metrics.daysOnHand?.toFixed(0) || "0"} days`],
    ["Gross Profit", `$${metrics.grossProfit?.toLocaleString() || "0"}`],
    ["Net Income", `$${metrics.netIncome?.toLocaleString() || "0"}`],
    ["Gross Margin", `${metrics.grossMargin?.toFixed(2) || "0"}%`],
    ["Net Margin", `${metrics.netMargin?.toFixed(2) || "0"}%`],
  ]
    .map((row) => row.join(","))
    .join("\n");

  return { data: csvData, error: null };
}
