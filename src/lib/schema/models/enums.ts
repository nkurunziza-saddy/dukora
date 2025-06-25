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
  "STOCK_ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "RETURN_SALE",
  "RETURN_PURCHASE",
  "PRODUCTION_INPUT",
  "PRODUCTION_OUTPUT",
] as const;

import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", USER_ROLES);
export const productStatusEnum = pgEnum("product_status", PRODUCT_STATUS);
export const orderStatusEnum = pgEnum("order_status", ORDER_STATUS);
export const transactionType = pgEnum("transaction_type", TRANSACTION_TYPE);
