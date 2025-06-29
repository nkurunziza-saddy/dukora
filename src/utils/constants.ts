import { UserRole } from "@/lib/schema/schema-types";

export const userRolesObject = [
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.OWNER, label: "Owner" },
  { value: UserRole.MEMBER, label: "Member" },
  { value: UserRole.VIEW_ONLY, label: "View only" },
];
