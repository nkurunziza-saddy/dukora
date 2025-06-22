// server/core/permissions/permissions.ts

// Define all possible permissions in the system
export enum Permission {
  // Business permissions
  BUSINESS_VIEW = "business:view",
  BUSINESS_CREATE = "business:create",
  BUSINESS_UPDATE = "business:update",
  BUSINESS_DELETE = "business:delete",

  // Product permissions
  PRODUCT_VIEW = "product:view",
  PRODUCT_CREATE = "product:create",
  PRODUCT_UPDATE = "product:update",
  PRODUCT_DELETE = "product:delete",
  PRODUCT_BULK_OPERATIONS = "product:bulk",

  // Inventory permissions
  INVENTORY_VIEW = "inventory:view",
  INVENTORY_UPDATE = "inventory:update",
  INVENTORY_ADJUST = "inventory:adjust",
  INVENTORY_TRANSFER = "inventory:transfer",
  INVENTORY_REPORTS = "inventory:reports",

  // Order permissions
  ORDER_VIEW = "order:view",
  ORDER_CREATE = "order:create",
  ORDER_UPDATE = "order:update",
  ORDER_DELETE = "order:delete",
  ORDER_APPROVE = "order:approve",
  ORDER_FULFILL = "order:fulfill",

  // User management permissions
  USER_VIEW = "user:view",
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",
  USER_ASSIGN_ROLES = "user:assign_roles",

  // Warehouse permissions
  WAREHOUSE_VIEW = "warehouse:view",
  WAREHOUSE_CREATE = "warehouse:create",
  WAREHOUSE_UPDATE = "warehouse:update",
  WAREHOUSE_DELETE = "warehouse:delete",

  // Category permissions
  CATEGORY_VIEW = "category:view",
  CATEGORY_CREATE = "category:create",
  CATEGORY_UPDATE = "category:update",
  CATEGORY_DELETE = "category:delete",

  // Supplier permissions
  SUPPLIER_VIEW = "supplier:view",
  SUPPLIER_CREATE = "supplier:create",
  SUPPLIER_UPDATE = "supplier:update",
  SUPPLIER_DELETE = "supplier:delete",

  // Transaction permissions
  TRANSACTION_PURCHASE_VIEW = "transaction:purchase:view",
  TRANSACTION_PURCHASE_CREATE = "transaction:purchase:create",
  TRANSACTION_PURCHASE_UPDATE = "transaction:purchase:update",
  TRANSACTION_PURCHASE_DELETE = "transaction:purchase:delete",

  TRANSACTION_SALE_VIEW = "transaction:sale:view",
  TRANSACTION_SALE_CREATE = "transaction:sale:create",
  TRANSACTION_SALE_UPDATE = "transaction:sale:update",
  TRANSACTION_SALE_DELETE = "transaction:sale:delete",

  TRANSACTION_DAMAGE_VIEW = "transaction:damage:view",
  TRANSACTION_DAMAGE_CREATE = "transaction:damage:create",
  TRANSACTION_DAMAGE_UPDATE = "transaction:damage:update",
  TRANSACTION_DAMAGE_DELETE = "transaction:damage:delete",

  TRANSACTION_STOCK_ADJUSTMENT_VIEW = "transaction:stock_adjustment:view",
  TRANSACTION_STOCK_ADJUSTMENT_CREATE = "transaction:stock_adjustment:create",
  TRANSACTION_STOCK_ADJUSTMENT_UPDATE = "transaction:stock_adjustment:update",
  TRANSACTION_STOCK_ADJUSTMENT_DELETE = "transaction:stock_adjustment:delete",

  TRANSACTION_TRANSFER_IN_VIEW = "transaction:transfer_in:view",
  TRANSACTION_TRANSFER_IN_CREATE = "transaction:transfer_in:create",
  TRANSACTION_TRANSFER_IN_UPDATE = "transaction:transfer_in:update",
  TRANSACTION_TRANSFER_IN_DELETE = "transaction:transfer_in:delete",

  TRANSACTION_TRANSFER_OUT_VIEW = "transaction:transfer_out:view",
  TRANSACTION_TRANSFER_OUT_CREATE = "transaction:transfer_out:create",
  TRANSACTION_TRANSFER_OUT_UPDATE = "transaction:transfer_out:update",
  TRANSACTION_TRANSFER_OUT_DELETE = "transaction:transfer_out:delete",

  TRANSACTION_RETURN_SALE_VIEW = "transaction:return_sale:view",
  TRANSACTION_RETURN_SALE_CREATE = "transaction:return_sale:create",
  TRANSACTION_RETURN_SALE_UPDATE = "transaction:return_sale:update",
  TRANSACTION_RETURN_SALE_DELETE = "transaction:return_sale:delete",

  TRANSACTION_RETURN_PURCHASE_VIEW = "transaction:return_purchase:view",
  TRANSACTION_RETURN_PURCHASE_CREATE = "transaction:return_purchase:create",
  TRANSACTION_RETURN_PURCHASE_UPDATE = "transaction:return_purchase:update",
  TRANSACTION_RETURN_PURCHASE_DELETE = "transaction:return_purchase:delete",

  TRANSACTION_PRODUCTION_INPUT_VIEW = "transaction:production_input:view",
  TRANSACTION_PRODUCTION_INPUT_CREATE = "transaction:production_input:create",
  TRANSACTION_PRODUCTION_INPUT_UPDATE = "transaction:production_input:update",
  TRANSACTION_PRODUCTION_INPUT_DELETE = "transaction:production_input:delete",

  TRANSACTION_PRODUCTION_OUTPUT_VIEW = "transaction:production_output:view",
  TRANSACTION_PRODUCTION_OUTPUT_CREATE = "transaction:production_output:create",
  TRANSACTION_PRODUCTION_OUTPUT_UPDATE = "transaction:production_output:update",
  TRANSACTION_PRODUCTION_OUTPUT_DELETE = "transaction:production_output:delete",

  // Customer permissions
  CUSTOMER_VIEW = "customer:view",
  CUSTOMER_CREATE = "customer:create",
  CUSTOMER_UPDATE = "customer:update",
  CUSTOMER_DELETE = "customer:delete",

  // Financial permissions
  FINANCIAL_VIEW = "financial:view",
  FINANCIAL_REPORTS = "financial:reports",
  FINANCIAL_EXPORT = "financial:export",

  // System permissions
  SYSTEM_SETTINGS = "system:settings",
  SYSTEM_BACKUP = "system:backup",
  SYSTEM_LOGS = "system:logs",
  SYSTEM_MAINTENANCE = "system:maintenance",

  // Audit permissions
  AUDIT_VIEW = "audit:view",
  AUDIT_EXPORT = "audit:export",
}

// Group permissions by feature for easier management
export const PermissionGroups = {
  BUSINESS: [
    Permission.BUSINESS_VIEW,
    Permission.BUSINESS_CREATE,
    Permission.BUSINESS_UPDATE,
    Permission.BUSINESS_DELETE,
  ],
  PRODUCTS: [
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.PRODUCT_BULK_OPERATIONS,
  ],
  INVENTORY: [
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_ADJUST,
    Permission.INVENTORY_TRANSFER,
    Permission.INVENTORY_REPORTS,
  ],
  ORDERS: [
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,
    Permission.ORDER_DELETE,
    Permission.ORDER_APPROVE,
    Permission.ORDER_FULFILL,
  ],
  USERS: [
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_ASSIGN_ROLES,
  ],
  WAREHOUSES: [
    Permission.WAREHOUSE_VIEW,
    Permission.WAREHOUSE_CREATE,
    Permission.WAREHOUSE_UPDATE,
    Permission.WAREHOUSE_DELETE,
  ],
  CATEGORIES: [
    Permission.CATEGORY_VIEW,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_UPDATE,
    Permission.CATEGORY_DELETE,
  ],
  SUPPLIERS: [
    Permission.SUPPLIER_VIEW,
    Permission.SUPPLIER_CREATE,
    Permission.SUPPLIER_UPDATE,
    Permission.SUPPLIER_DELETE,
  ],
  TRANSACTIONS: [
    Permission.TRANSACTION_PURCHASE_VIEW,
    Permission.TRANSACTION_PURCHASE_CREATE,
    Permission.TRANSACTION_PURCHASE_UPDATE,
    Permission.TRANSACTION_PURCHASE_DELETE,
    Permission.TRANSACTION_SALE_VIEW,
    Permission.TRANSACTION_SALE_CREATE,
    Permission.TRANSACTION_SALE_UPDATE,
    Permission.TRANSACTION_SALE_DELETE,
    Permission.TRANSACTION_DAMAGE_VIEW,
    Permission.TRANSACTION_DAMAGE_CREATE,
    Permission.TRANSACTION_DAMAGE_UPDATE,
    Permission.TRANSACTION_DAMAGE_DELETE,
    Permission.TRANSACTION_STOCK_ADJUSTMENT_VIEW,
    Permission.TRANSACTION_STOCK_ADJUSTMENT_CREATE,
    Permission.TRANSACTION_STOCK_ADJUSTMENT_UPDATE,
    Permission.TRANSACTION_STOCK_ADJUSTMENT_DELETE,
    Permission.TRANSACTION_TRANSFER_IN_VIEW,
    Permission.TRANSACTION_TRANSFER_IN_CREATE,
    Permission.TRANSACTION_TRANSFER_IN_UPDATE,
    Permission.TRANSACTION_TRANSFER_IN_DELETE,
    Permission.TRANSACTION_TRANSFER_OUT_VIEW,
    Permission.TRANSACTION_TRANSFER_OUT_CREATE,
    Permission.TRANSACTION_TRANSFER_OUT_UPDATE,
    Permission.TRANSACTION_TRANSFER_OUT_DELETE,
    Permission.TRANSACTION_RETURN_SALE_VIEW,
    Permission.TRANSACTION_RETURN_SALE_CREATE,
    Permission.TRANSACTION_RETURN_SALE_UPDATE,
    Permission.TRANSACTION_RETURN_SALE_DELETE,
    Permission.TRANSACTION_RETURN_PURCHASE_VIEW,
    Permission.TRANSACTION_RETURN_PURCHASE_CREATE,
    Permission.TRANSACTION_RETURN_PURCHASE_UPDATE,
    Permission.TRANSACTION_RETURN_PURCHASE_DELETE,
    Permission.TRANSACTION_PRODUCTION_INPUT_VIEW,
    Permission.TRANSACTION_PRODUCTION_INPUT_CREATE,
    Permission.TRANSACTION_PRODUCTION_INPUT_UPDATE,
    Permission.TRANSACTION_PRODUCTION_INPUT_DELETE,
    Permission.TRANSACTION_PRODUCTION_OUTPUT_VIEW,
    Permission.TRANSACTION_PRODUCTION_OUTPUT_CREATE,
    Permission.TRANSACTION_PRODUCTION_OUTPUT_UPDATE,
    Permission.TRANSACTION_PRODUCTION_OUTPUT_DELETE,
  ],
  CUSTOMERS: [
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE,
    Permission.CUSTOMER_DELETE,
  ],
  FINANCIAL: [
    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_REPORTS,
    Permission.FINANCIAL_EXPORT,
  ],
  SYSTEM: [
    Permission.SYSTEM_SETTINGS,
    Permission.SYSTEM_BACKUP,
    Permission.SYSTEM_LOGS,
    Permission.SYSTEM_MAINTENANCE,
  ],
  AUDIT: [Permission.AUDIT_VIEW, Permission.AUDIT_EXPORT],
} as const;
