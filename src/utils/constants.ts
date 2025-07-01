import { TransactionType, UserRole } from "@/lib/schema/schema-types";

export const userRolesObject = [
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.OWNER, label: "Owner" },
  { value: UserRole.MEMBER, label: "Member" },
  { value: UserRole.VIEW_ONLY, label: "View only" },
];
export const transactionTypesObject = [
  { value: TransactionType.DAMAGE, label: "Damage" },
  { value: TransactionType.PURCHASE, label: "Purchase" },
  { value: TransactionType.SALE, label: "Sale" },
  { value: TransactionType.RETURN_PURCHASE, label: "Return Purchase" },
  { value: TransactionType.RETURN_SALE, label: "Return Sale" },
];
