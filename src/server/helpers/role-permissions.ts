import { UserRole } from "@/lib/schema/schema-types";
import { Permission, PermissionGroups } from "../constants/permissions";

// Define permissions for each role
export const RolePermissions = {
  [UserRole.SUPER_ADMIN]: [...Object.values(Permission)],

  [UserRole.ADMIN]: [
    // Product management
    ...PermissionGroups.PRODUCTS,

    // Inventory management
    ...PermissionGroups.INVENTORY,

    // Order management
    ...PermissionGroups.ORDERS,

    // User management (except role assignment)
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,

    // Warehouse management
    Permission.WAREHOUSE_VIEW,
    Permission.WAREHOUSE_CREATE,
    Permission.WAREHOUSE_UPDATE,

    // Category management
    Permission.CATEGORY_VIEW,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_UPDATE,
    Permission.CATEGORY_DELETE,

    // Supplier/Customer management
    Permission.SUPPLIER_VIEW,
    Permission.SUPPLIER_CREATE,
    Permission.SUPPLIER_UPDATE,
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE,

    // Financial access
    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_REPORTS,

    // Audit access
    Permission.AUDIT_VIEW,
  ],

  [UserRole.WAREHOUSE_OPERATIVE]: [
    // Product viewing and basic updates
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_UPDATE, // Can update stock levels, locations

    // Inventory operations
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_ADJUST,
    Permission.INVENTORY_TRANSFER,

    // Order fulfillment
    Permission.ORDER_VIEW,
    Permission.ORDER_FULFILL,

    // Basic warehouse access
    Permission.WAREHOUSE_VIEW,

    // Category viewing
    Permission.CATEGORY_VIEW,

    // Supplier/Customer viewing (for order processing)
    Permission.SUPPLIER_VIEW,
    Permission.CUSTOMER_VIEW,
  ],

  [UserRole.VIEW_ONLY]: [
    // Read-only access to most data
    Permission.PRODUCT_VIEW,
    Permission.INVENTORY_VIEW,
    Permission.ORDER_VIEW,
    Permission.WAREHOUSE_VIEW,
    Permission.CATEGORY_VIEW,
    Permission.SUPPLIER_VIEW,
    Permission.CUSTOMER_VIEW,

    // Basic reports
    Permission.INVENTORY_REPORTS,
  ],
} as Record<UserRole, Permission[]>;

// Helper function to get permissions for a role
export function getPermissionsForRole(role: UserRole): Permission[] {
  return RolePermissions[role] || [];
}

// Helper function to check if role has permission
export function roleHasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return RolePermissions[role]?.includes(permission) || false;
}

// Helper function to check multiple permissions
export function roleHasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  const rolePermissions = RolePermissions[role] || [];
  return permissions.every((permission) =>
    rolePermissions.includes(permission)
  );
}

// Helper function to check if role has any of the permissions
export function roleHasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  const rolePermissions = RolePermissions[role] || [];
  return permissions.some((permission) => rolePermissions.includes(permission));
}
