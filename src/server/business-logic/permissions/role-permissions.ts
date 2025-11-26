import { UserRole } from "@/lib/schema/schema-types";
import { PERMISSION, PermissionGroups } from "@/server/constants/permissions";

export const RolePermissions = {
  [UserRole.OWNER]: [...Object.values(PERMISSION)],

  [UserRole.ADMIN]: [
    ...PermissionGroups.PRODUCTS,
    ...PermissionGroups.INVENTORY,
    ...PermissionGroups.ORDERS,
    ...PermissionGroups.CATEGORIES,
    ...PermissionGroups.INVITATIONS,
    PERMISSION.USER_VIEW,
    PERMISSION.USER_CREATE,
    PERMISSION.USER_UPDATE,
    PERMISSION.WAREHOUSE_VIEW,
    PERMISSION.WAREHOUSE_CREATE,
    PERMISSION.WAREHOUSE_UPDATE,
    PERMISSION.SUPPLIER_VIEW,
    PERMISSION.SUPPLIER_CREATE,
    PERMISSION.SUPPLIER_UPDATE,
    PERMISSION.CUSTOMER_VIEW,
    PERMISSION.CUSTOMER_CREATE,
    PERMISSION.CUSTOMER_UPDATE,
    PERMISSION.FINANCIAL_VIEW,
    PERMISSION.FINANCIAL_REPORTS,
    PERMISSION.AUDIT_VIEW,
  ],

  [UserRole.MEMBER]: [
    PERMISSION.PRODUCT_VIEW,
    PERMISSION.PRODUCT_UPDATE,
    PERMISSION.INVENTORY_VIEW,
    PERMISSION.INVENTORY_UPDATE,
    PERMISSION.INVENTORY_ADJUST,
    PERMISSION.INVENTORY_TRANSFER,
    PERMISSION.ORDER_VIEW,
    PERMISSION.ORDER_FULFILL,
    PERMISSION.WAREHOUSE_VIEW,
    PERMISSION.CATEGORY_VIEW,
    PERMISSION.SUPPLIER_VIEW,
    PERMISSION.CUSTOMER_VIEW,
  ],

  [UserRole.VIEW_ONLY]: [
    PERMISSION.PRODUCT_VIEW,
    PERMISSION.INVENTORY_VIEW,
    PERMISSION.ORDER_VIEW,
    PERMISSION.WAREHOUSE_VIEW,
    PERMISSION.CATEGORY_VIEW,
    PERMISSION.SUPPLIER_VIEW,
    PERMISSION.CUSTOMER_VIEW,
    PERMISSION.INVENTORY_REPORTS,
  ],
} as Record<UserRole, PERMISSION[]>;

export function getPermissionsForRole(role: UserRole): PERMISSION[] {
  return RolePermissions[role] || [];
}

export function roleHasPermission(
  role: UserRole,
  permission: PERMISSION
): boolean {
  return RolePermissions[role]?.includes(permission) || false;
}

export function roleHasAllPermissions(
  role: UserRole,
  permissions: PERMISSION[]
): boolean {
  const rolePermissions = RolePermissions[role] || [];
  return permissions.every((permission) =>
    rolePermissions.includes(permission)
  );
}

export function roleHasAnyPermission(
  role: UserRole,
  permissions: PERMISSION[]
): boolean {
  const rolePermissions = RolePermissions[role] || [];
  return permissions.some((permission) => rolePermissions.includes(permission));
}

export function getPermissionCount(role: UserRole): number {
  return RolePermissions[role]?.length || 0;
}

export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}
