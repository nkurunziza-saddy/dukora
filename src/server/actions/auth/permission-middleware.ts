import { getCurrentSession } from "@/lib/auth";
import type { Permission } from "@/server/constants/permissions";
import { roleHasPermission } from "@/server/helpers/role-permissions";

export async function getUserIfHasPermission(permission: Permission) {
  const session = await getCurrentSession();
  if (!session) return null;
  const { role } = session.user;
  const doesHavePermission = roleHasPermission(role!, permission);
  return doesHavePermission ? session.user : null;
}
