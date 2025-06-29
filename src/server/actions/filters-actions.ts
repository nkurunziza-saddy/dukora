import { TransactionType } from "@/lib/schema/schema-types";
import { getFilteredTransactions } from "@/server/repos/statistics/transactions-stat-repo";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
export async function fetchTransactionsByFilters(
  limit = 10,
  offset = 0,
  sortBy: "createdAt" | "quantity" = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
  typeFilter?: TransactionType,
  dateFrom?: string,
  dateTo?: string
) {
  try {
    const currentUser = await getUserIfHasPermission(Permission.FINANCIAL_VIEW);
    if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

    const dateFromObj = dateFrom ? new Date(dateFrom) : undefined;
    const dateToObj = dateTo ? new Date(dateTo) : undefined;

    const data = await getFilteredTransactions(
      currentUser.id,
      limit,
      offset,
      sortBy,
      sortOrder,
      typeFilter,
      dateFromObj,
      dateToObj
    );
    return { data: data.data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get recent transactions",
    };
  }
}
