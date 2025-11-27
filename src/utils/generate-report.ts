export function generateCSVReport(
  metrics: Record<string, unknown>,
  currency: string = "RWF"
) {
  const csvData = [
    ["Metric", "Value"],
    [
      "Gross Revenue",
      `${currency} ${(metrics.grossRevenue as number)?.toLocaleString() || "0"}`,
    ],
    [
      "Net Revenue",
      `${currency} ${(metrics.netRevenue as number)?.toLocaleString() || "0"}`,
    ],
    [
      "Opening Stock",
      `${currency} ${(metrics.openingStock as number)?.toLocaleString() || "0"}`,
    ],
    [
      "Closing Stock",
      `${currency} ${(metrics.closingStock as number)?.toLocaleString() || "0"}`,
    ],
    [
      "Inventory Turnover",
      `${(metrics.inventoryTurnover as number)?.toFixed(2) || "0"}x`,
    ],
    [
      "Days on Hand",
      `${(metrics.daysOnHand as number)?.toFixed(0) || "0"} days`,
    ],
    [
      "Gross Profit",
      `${currency} ${(metrics.grossProfit as number)?.toLocaleString() || "0"}`,
    ],
    [
      "Net Income",
      `${currency} ${(metrics.netIncome as number)?.toLocaleString() || "0"}`,
    ],
    ["Gross Margin", `${(metrics.grossMargin as number)?.toFixed(2) || "0"}%`],
    ["Net Margin", `${(metrics.netMargin as number)?.toFixed(2) || "0"}%`],
  ]
    .map((row) => row.join(","))
    .join("\n");

  return { data: csvData, error: null };
}
