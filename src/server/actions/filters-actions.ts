import type { TransactionType } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { get_filtered_transactions } from "@/server/repos/statistics-repo/transactions-stat-repo";

export async function getTransactionsByFilters(
  limit = 10,
  offset = 0,
  sortBy: "createdAt" | "quantity" = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
  typeFilter?: TransactionType,
  dateFrom?: string,
  dateTo?: string
) {
  try {
    const currentUser = await getUserIfHasPermission(PERMISSION.FINANCIAL_VIEW);
    if (!currentUser) return { data: null, error: ERROR_CODE.UNAUTHORIZED };

    const dateFromObj = dateFrom ? new Date(dateFrom) : undefined;
    const dateToObj = dateTo ? new Date(dateTo) : undefined;

    const data = await get_filtered_transactions(
      currentUser.id,
      limit,
      offset,
      sortBy,
      sortOrder,
      typeFilter,
      dateFromObj,
      dateToObj
    );

    if (data.error) {
      return { data: null, error: ERROR_CODE.UNAUTHORIZED };
    }

    return { data: data.data, error: null };
  } catch (error) {
    if (error instanceof Error && error.message === ERROR_CODE.UNAUTHORIZED) {
      return { data: null, error: ERROR_CODE.UNAUTHORIZED };
    }
    return {
      data: null,
      error: "Failed to get recent transactions",
    };
  }
}
