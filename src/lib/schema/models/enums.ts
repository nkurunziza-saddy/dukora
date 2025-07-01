export const USER_ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEW_ONLY"] as const;

export const PRODUCT_STATUS = ["ACTIVE", "INACTIVE", "DISCONTINUED"] as const;

export const ORDER_STATUS = [
  "DRAFT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export const TRANSACTION_TYPE = [
  "PURCHASE",
  "SALE",
  "DAMAGE",
  "RETURN_SALE",
  "RETURN_PURCHASE",
] as const;

export const METRIC_NAMES = {
  GROSS_REVENUE: "grossRevenue",
  NET_REVENUE: "netRevenue",
  RETURNS: "returns",
  AVERAGE_ORDER_VALUE: "averageOrderValue",
  TRANSACTION_COUNT: "transactionCount",
  OPENING_STOCK: "openingStock",
  CLOSING_STOCK: "closingStock",
  PURCHASES: "purchases",
  COST_OF_GOODS_SOLD: "costOfGoodsSold",
  AVERAGE_INVENTORY: "averageInventory",
  INVENTORY_TURNOVER: "inventoryTurnover",
  DAYS_ON_HAND: "daysOnHand",
  TOTAL_EXPENSES: "totalExpenses",
  OPERATING_EXPENSES: "operatingExpenses",
  GROSS_PROFIT: "grossProfit",
  OPERATING_INCOME: "operatingIncome",
  NET_INCOME: "netIncome",
  GROSS_MARGIN: "grossMargin",
  NET_MARGIN: "netMargin",
  OPERATING_MARGIN: "operatingMargin",
  OPERATING_CASH_FLOW: "operatingCashFlow",
  FREE_CASH_FLOW: "freeCashFlow",
  NEW_CUSTOMERS: "newCustomers",
  CUSTOMER_ACQUISITION_COST: "customerAcquisitionCost",
  CUSTOMER_LIFETIME_VALUE: "customerLifetimeValue",
  CHURN_RATE: "churnRate",
} as const;

import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", USER_ROLES);
export const productStatusEnum = pgEnum("product_status", PRODUCT_STATUS);
export const orderStatusEnum = pgEnum("order_status", ORDER_STATUS);
export const transactionType = pgEnum("transaction_type", TRANSACTION_TYPE);
export type MetricName = (typeof METRIC_NAMES)[keyof typeof METRIC_NAMES];
