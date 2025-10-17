import type { TransactionType } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { getFilteredTransactions } from "@/server/repos/statistics/transactions-stat-repo";
export async function fetchTransactionsByFilters(
  limit = 10,
  offset = 0,
  sortBy: "createdAt" | "quantity" = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
  typeFilter?: TransactionType,
  dateFrom?: string,
  dateTo?: string,
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
      dateToObj,
    );

    if (data.error) {
      return { data: null, error: ErrorCode.UNAUTHORIZED };
    }

    return { data: data.data, error: null };
  } catch (error) {
    if (error instanceof Error && error.message === ErrorCode.UNAUTHORIZED) {
      return { data: null, error: ErrorCode.UNAUTHORIZED };
    }
    return {
      data: null,
      error: "Failed to get recent transactions",
    };
  }
}
