import { UserRole } from "@/lib/schema/schema-types";
import { Permission, PermissionGroups } from "../constants/permissions";

export const RolePermissions = {
  [UserRole.OWNER]: [...Object.values(Permission)],

  [UserRole.ADMIN]: [
    ...PermissionGroups.PRODUCTS,

    ...PermissionGroups.INVENTORY,

    ...PermissionGroups.ORDERS,

    ...PermissionGroups.CATEGORIES,

    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,

    Permission.WAREHOUSE_VIEW,
    Permission.WAREHOUSE_CREATE,
    Permission.WAREHOUSE_UPDATE,

    Permission.SUPPLIER_VIEW,
    Permission.SUPPLIER_CREATE,
    Permission.SUPPLIER_UPDATE,
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE,

    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_REPORTS,

    Permission.AUDIT_VIEW,
  ],

  [UserRole.MEMBER]: [
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_UPDATE,

    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_ADJUST,
    Permission.INVENTORY_TRANSFER,

    Permission.ORDER_VIEW,
    Permission.ORDER_FULFILL,

    Permission.WAREHOUSE_VIEW,

    Permission.CATEGORY_VIEW,

    Permission.SUPPLIER_VIEW,
    Permission.CUSTOMER_VIEW,
  ],

  [UserRole.VIEW_ONLY]: [
    Permission.PRODUCT_VIEW,
    Permission.INVENTORY_VIEW,
    Permission.ORDER_VIEW,
    Permission.WAREHOUSE_VIEW,
    Permission.CATEGORY_VIEW,
    Permission.SUPPLIER_VIEW,
    Permission.CUSTOMER_VIEW,

    Permission.INVENTORY_REPORTS,
  ],
} as Record<UserRole, Permission[]>;

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
