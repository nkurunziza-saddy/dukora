"use cache";

import { and, count, eq, getTableColumns, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { invitationsTable, usersTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const invitationColumns = getTableColumns(invitationsTable);
    const invitations = await db
      .select({
        ...invitationColumns,
        invitedByUser: usersTable,
      })
      .from(invitationsTable)
      .innerJoin(usersTable, eq(usersTable.id, invitationsTable.invitedBy))
      .where(
        and(
          eq(invitationsTable.businessId, businessId),
          isNull(invitationsTable.deletedAt),
        ),
      );
    return { data: invitations, error: null };
  } catch (error) {
    console.error("Failed to fetch invitations:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_all_paginated = async (
  businessId: string,
  page: number,
  pageSize: number,
) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const offset = (page - 1) * pageSize;
    const invitationColumns = getTableColumns(invitationsTable);
    const invitations = await db
      .select({
        ...invitationColumns,
        invitedByUser: usersTable,
      })
      .from(invitationsTable)
      .innerJoin(usersTable, eq(usersTable.id, invitationsTable.invitedBy))
      .where(
        and(
          eq(invitationsTable.businessId, businessId),
          isNull(invitationsTable.deletedAt),
        ),
      )
      .limit(pageSize)
      .offset(offset);
    const [totalCount] = await db
      .select({
        count: count(),
      })
      .from(invitationsTable)
      .innerJoin(usersTable, eq(usersTable.id, invitationsTable.invitedBy))
      .where(
        and(
          eq(invitationsTable.businessId, businessId),
          isNull(invitationsTable.deletedAt),
        ),
      );
    return {
      data: { invitations, totalCount: totalCount.count || 0 },
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch invitations:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export async function get_by_id(invitationId: string, businessId: string) {
  if (!invitationId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const invitation = await db.query.invitationsTable.findFirst({
      where: and(
        eq(invitationsTable.id, invitationId),
        eq(invitationsTable.businessId, businessId),
      ),
    });

    if (!invitation) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND,
      };
    }

    return { data: invitation, error: null };
  } catch (error) {
    console.error("Failed to fetch invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
