export function generateCSVReport(metrics: Record<string, unknown>) {
  const csvData = [
    ["Metric", "Value"],
    [
      "Gross Revenue",
      `$${(metrics.grossRevenue as number)?.toLocaleString() || "0"}`,
    ],
    [
      "Net Revenue",
      `$${(metrics.netRevenue as number)?.toLocaleString() || "0"}`,
    ],
    [
      "Opening Stock",
      `$${(metrics.openingStock as number)?.toLocaleString() || "0"}`,
    ],
    [
      "Closing Stock",
      `$${(metrics.closingStock as number)?.toLocaleString() || "0"}`,
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
      `$${(metrics.grossProfit as number)?.toLocaleString() || "0"}`,
    ],
    [
      "Net Income",
      `$${(metrics.netIncome as number)?.toLocaleString() || "0"}`,
    ],
    ["Gross Margin", `${(metrics.grossMargin as number)?.toFixed(2) || "0"}%`],
    ["Net Margin", `${(metrics.netMargin as number)?.toFixed(2) || "0"}%`],
  ]
    .map((row) => row.join(","))
    .join("\n");

  return { data: csvData, error: null };
}
