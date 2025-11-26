/**
 * Test Suite for PERMISSION Functions
 *
 * Run with: npx tsx src/__tests__/business-logic/permissions/test-role-permissions.ts
 *
 * Tests pure permission checking functions (no database/auth needed)
 */

import { UserRole } from "@/lib/schema/schema-types";
import {
  getPermissionCount,
  getPermissionsForRole,
  isValidRole,
  roleHasAllPermissions,
  roleHasAnyPermission,
  roleHasPermission,
} from "@/server/business-logic/permissions";
import { PERMISSION } from "@/server/constants/permissions";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

let testsPassed = 0;
let testsFailed = 0;

function assert(
  condition: boolean,
  testName: string,
  expected?: unknown,
  actual?: unknown
) {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (expected !== undefined && actual !== undefined) {
      console.log(
        `  Expected: ${colors.yellow}${JSON.stringify(expected)}${colors.reset}`
      );
      console.log(
        `  Actual:   ${colors.red}${JSON.stringify(actual)}${colors.reset}`
      );
    }
    testsFailed++;
  }
}

function testSection(name: string) {
  console.log(`\n${colors.cyan}━━━ ${name} ━━━${colors.reset}`);
}

// ============================================================================
// Test getPermissionsForRole
// ============================================================================
function testGetPermissionsForRole() {
  testSection("getPermissionsForRole");

  // Test 1: Owner has all permissions
  const ownerPerms = getPermissionsForRole(UserRole.OWNER);
  assert(
    ownerPerms.length > 0,
    "OWNER should have permissions",
    true,
    ownerPerms.length > 0
  );

  // Test 2: Admin has permissions
  const adminPerms = getPermissionsForRole(UserRole.ADMIN);
  assert(
    adminPerms.length > 0,
    "ADMIN should have permissions",
    true,
    adminPerms.length > 0
  );

  // Test 3: Member has permissions
  const memberPerms = getPermissionsForRole(UserRole.MEMBER);
  assert(
    memberPerms.length > 0,
    "MEMBER should have permissions",
    true,
    memberPerms.length > 0
  );

  // Test 4: View only has permissions
  const viewOnlyPerms = getPermissionsForRole(UserRole.VIEW_ONLY);
  assert(
    viewOnlyPerms.length > 0,
    "VIEW_ONLY should have permissions",
    true,
    viewOnlyPerms.length > 0
  );

  // Test 5: Owner has more permissions than Admin
  assert(
    ownerPerms.length > adminPerms.length,
    "OWNER should have more permissions than ADMIN"
  );

  // Test 6: Admin has more permissions than Member
  assert(
    adminPerms.length > memberPerms.length,
    "ADMIN should have more permissions than MEMBER"
  );

  // Test 7: Member has more permissions than View Only
  assert(
    memberPerms.length > viewOnlyPerms.length,
    "MEMBER should have more permissions than VIEW_ONLY"
  );

  // Test 8: Returns array for all roles
  assert(Array.isArray(ownerPerms), "should return array for OWNER");
}

// ============================================================================
// Test roleHasPermission
// ============================================================================
function testRoleHasPermission() {
  testSection("roleHasPermission");

  // Test 1: Owner has product view
  assert(
    roleHasPermission(UserRole.OWNER, PERMISSION.PRODUCT_VIEW) === true,
    "OWNER should have PRODUCT_VIEW"
  );

  // Test 2: Admin has product view
  assert(
    roleHasPermission(UserRole.ADMIN, PERMISSION.PRODUCT_VIEW) === true,
    "ADMIN should have PRODUCT_VIEW"
  );

  // Test 3: Member has product view
  assert(
    roleHasPermission(UserRole.MEMBER, PERMISSION.PRODUCT_VIEW) === true,
    "MEMBER should have PRODUCT_VIEW"
  );

  // Test 4: View only has product view
  assert(
    roleHasPermission(UserRole.VIEW_ONLY, PERMISSION.PRODUCT_VIEW) === true,
    "VIEW_ONLY should have PRODUCT_VIEW"
  );

  // Test 5: Member doesn't have product create
  assert(
    roleHasPermission(UserRole.MEMBER, PERMISSION.PRODUCT_CREATE) === false,
    "MEMBER should NOT have PRODUCT_CREATE"
  );

  // Test 6: View only doesn't have product create
  assert(
    roleHasPermission(UserRole.VIEW_ONLY, PERMISSION.PRODUCT_CREATE) === false,
    "VIEW_ONLY should NOT have PRODUCT_CREATE"
  );

  // Test 7: Admin has product create
  assert(
    roleHasPermission(UserRole.ADMIN, PERMISSION.PRODUCT_CREATE) === true,
    "ADMIN should have PRODUCT_CREATE"
  );

  // Test 8: Owner has user delete
  assert(
    roleHasPermission(UserRole.OWNER, PERMISSION.USER_DELETE) === true,
    "OWNER should have USER_DELETE"
  );

  // Test 9: Admin doesn't have user delete
  assert(
    roleHasPermission(UserRole.ADMIN, PERMISSION.USER_DELETE) === false,
    "ADMIN should NOT have USER_DELETE"
  );

  // Test 10: View only doesn't have inventory update
  assert(
    roleHasPermission(UserRole.VIEW_ONLY, PERMISSION.INVENTORY_UPDATE) ===
      false,
    "VIEW_ONLY should NOT have INVENTORY_UPDATE"
  );
}

// ============================================================================
// Test roleHasAllPermissions
// ============================================================================
function testRoleHasAllPermissions() {
  testSection("roleHasAllPermissions");

  // Test 1: Owner has all view permissions
  const viewPerms = [
    PERMISSION.PRODUCT_VIEW,
    PERMISSION.INVENTORY_VIEW,
    PERMISSION.ORDER_VIEW,
  ];
  assert(
    roleHasAllPermissions(UserRole.OWNER, viewPerms) === true,
    "OWNER should have all view permissions"
  );

  // Test 2: Admin has all view permissions
  assert(
    roleHasAllPermissions(UserRole.ADMIN, viewPerms) === true,
    "ADMIN should have all view permissions"
  );

  // Test 3: Member has all view permissions
  assert(
    roleHasAllPermissions(UserRole.MEMBER, viewPerms) === true,
    "MEMBER should have all view permissions"
  );

  // Test 4: View only has all view permissions
  assert(
    roleHasAllPermissions(UserRole.VIEW_ONLY, viewPerms) === true,
    "VIEW_ONLY should have all view permissions"
  );

  // Test 5: Member doesn't have all create permissions
  const createPerms = [
    PERMISSION.PRODUCT_CREATE,
    PERMISSION.CATEGORY_CREATE,
    PERMISSION.SUPPLIER_CREATE,
  ];
  assert(
    roleHasAllPermissions(UserRole.MEMBER, createPerms) === false,
    "MEMBER should NOT have all create permissions"
  );

  // Test 6: Admin has all these create permissions
  assert(
    roleHasAllPermissions(UserRole.ADMIN, createPerms) === true,
    "ADMIN should have these create permissions"
  );

  // Test 7: Empty array returns true
  assert(
    roleHasAllPermissions(UserRole.MEMBER, []) === true,
    "should return true for empty permission array"
  );

  // Test 8: Mixed permissions - some yes, some no
  const mixedPerms = [
    PERMISSION.PRODUCT_VIEW,
    PERMISSION.PRODUCT_CREATE, // Member doesn't have this
  ];
  assert(
    roleHasAllPermissions(UserRole.MEMBER, mixedPerms) === false,
    "MEMBER should NOT have all mixed permissions"
  );
}

// ============================================================================
// Test roleHasAnyPermission
// ============================================================================
function testRoleHasAnyPermission() {
  testSection("roleHasAnyPermission");

  // Test 1: Owner has any permission
  const somePerms = [PERMISSION.PRODUCT_VIEW, PERMISSION.USER_DELETE];
  assert(
    roleHasAnyPermission(UserRole.OWNER, somePerms) === true,
    "OWNER should have any of the permissions"
  );

  // Test 2: Member has at least one
  assert(
    roleHasAnyPermission(UserRole.MEMBER, somePerms) === true,
    "MEMBER should have at least one permission (PRODUCT_VIEW)"
  );

  // Test 3: View only has at least one
  assert(
    roleHasAnyPermission(UserRole.VIEW_ONLY, somePerms) === true,
    "VIEW_ONLY should have at least one permission (PRODUCT_VIEW)"
  );

  // Test 4: Member doesn't have any admin permissions
  const adminPerms = [PERMISSION.USER_DELETE, PERMISSION.BUSINESS_DELETE];
  assert(
    roleHasAnyPermission(UserRole.MEMBER, adminPerms) === false,
    "MEMBER should NOT have any admin permissions"
  );

  // Test 5: Empty array returns false
  assert(
    roleHasAnyPermission(UserRole.MEMBER, []) === false,
    "should return false for empty permission array"
  );

  // Test 6: All permissions member doesn't have
  const noPerms = [PERMISSION.PRODUCT_CREATE, PERMISSION.USER_CREATE];
  assert(
    roleHasAnyPermission(UserRole.MEMBER, noPerms) === false,
    "MEMBER should NOT have any of these permissions"
  );
}

// ============================================================================
// Test getPermissionCount
// ============================================================================
function testGetPermissionCount() {
  testSection("getPermissionCount");

  // Test 1: Owner has most permissions
  const ownerCount = getPermissionCount(UserRole.OWNER);
  assert(ownerCount > 0, "OWNER should have positive permission count");

  // Test 2: Admin has fewer than owner
  const adminCount = getPermissionCount(UserRole.ADMIN);
  assert(
    adminCount > 0 && adminCount < ownerCount,
    "ADMIN should have fewer permissions than OWNER"
  );

  // Test 3: Member has fewer than admin
  const memberCount = getPermissionCount(UserRole.MEMBER);
  assert(
    memberCount > 0 && memberCount < adminCount,
    "MEMBER should have fewer permissions than ADMIN"
  );

  // Test 4: View only has fewest
  const viewOnlyCount = getPermissionCount(UserRole.VIEW_ONLY);
  assert(
    viewOnlyCount > 0 && viewOnlyCount < memberCount,
    "VIEW_ONLY should have fewer permissions than MEMBER"
  );

  // Test 5: Hierarchy is correct
  assert(
    ownerCount > adminCount &&
      adminCount > memberCount &&
      memberCount > viewOnlyCount,
    "permission count hierarchy should be maintained"
  );
}

// ============================================================================
// Test isValidRole
// ============================================================================
function testIsValidRole() {
  testSection("isValidRole");

  // Test 1: OWNER is valid
  assert(isValidRole("OWNER") === true, "OWNER should be a valid role");

  // Test 2: ADMIN is valid
  assert(isValidRole("ADMIN") === true, "ADMIN should be a valid role");

  // Test 3: MEMBER is valid
  assert(isValidRole("MEMBER") === true, "MEMBER should be a valid role");

  // Test 4: VIEW_ONLY is valid
  assert(isValidRole("VIEW_ONLY") === true, "VIEW_ONLY should be a valid role");

  // Test 5: Invalid role
  assert(
    isValidRole("SUPER_ADMIN") === false,
    "SUPER_ADMIN should NOT be a valid role"
  );

  // Test 6: Empty string
  assert(isValidRole("") === false, "empty string should NOT be a valid role");

  // Test 7: Lowercase
  assert(
    isValidRole("owner") === false,
    "lowercase 'owner' should NOT be a valid role"
  );
}

// ============================================================================
// Integration Tests
// ============================================================================
function testIntegration() {
  testSection("Integration Tests");

  // Test 1: Owner should have all permissions that Admin has
  const adminPerms = getPermissionsForRole(UserRole.ADMIN);
  assert(
    roleHasAllPermissions(UserRole.OWNER, adminPerms) === true,
    "OWNER should have all permissions that ADMIN has"
  );

  // Test 2: Admin should have all permissions that Member has
  const memberPerms = getPermissionsForRole(UserRole.MEMBER);
  assert(
    roleHasAllPermissions(UserRole.ADMIN, memberPerms) === true,
    "ADMIN should have all permissions that MEMBER has"
  );

  // Test 3: View only permissions are subset of member (mostly, with some exceptions)
  const viewOnlyPerms = getPermissionsForRole(UserRole.VIEW_ONLY);
  const memberHasMostViewOnlyPerms = viewOnlyPerms
    .filter(
      (p) => p !== PERMISSION.INVENTORY_REPORTS // VIEW_ONLY has this, MEMBER may not
    )
    .every((p) => memberPerms.includes(p));
  assert(
    memberHasMostViewOnlyPerms === true,
    "MEMBER should have most VIEW_ONLY permissions (except special cases)"
  );

  // Test 4: No duplicate permissions in any role
  const allRoles = [
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.MEMBER,
    UserRole.VIEW_ONLY,
  ];
  for (const role of allRoles) {
    const perms = getPermissionsForRole(role);
    const uniquePerms = [...new Set(perms)];
    assert(
      perms.length === uniquePerms.length,
      `${role} should have no duplicate permissions`
    );
  }
}

// ============================================================================
// Run All Tests
// ============================================================================
async function runAllTests() {
  console.log(
    `${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.blue}║  PERMISSION Test Suite                                     ║${colors.reset}`
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`
  );

  testGetPermissionsForRole();
  testRoleHasPermission();
  testRoleHasAllPermissions();
  testRoleHasAnyPermission();
  testGetPermissionCount();
  testIsValidRole();
  testIntegration();

  // Summary
  console.log(
    `\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(`${colors.cyan}Test Summary:${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`  Total:  ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log(`\n${colors.green}✓ All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed!${colors.reset}\n`);
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch((error) => {
  console.error(
    `${colors.red}Test suite failed with error:${colors.reset}`,
    error
  );
  process.exit(1);
});
