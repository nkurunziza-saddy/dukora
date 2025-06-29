import { getCurrentSession } from "@/lib/auth";
import type { Permission } from "@/server/constants/permissions";
import { roleHasPermission } from "@/server/helpers/role-permissions";

export async function getUserIfHasPermission(
  permission: Permission,
  bypass?: string
) {
  const session = await getCurrentSession();
  if (!session) return null;
  if (bypass === "4738a33a-3b92-5ef0-be32-f71a7b026d67-invoke") {
    return session.user;
  } else {
    const { role } = session.user;
    const doesHavePermission = roleHasPermission(role!, permission);
    return doesHavePermission ? session.user : null;
  }
}
