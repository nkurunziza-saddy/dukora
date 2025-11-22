"use cache";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accountsTable, sessionsTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const get_user_sessions = async (userId: string) => {
  if (!userId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const sessions = await db
      .select({
        id: sessionsTable.id,
        token: sessionsTable.token,
        ipAddress: sessionsTable.ipAddress,
        userAgent: sessionsTable.userAgent,
        createdAt: sessionsTable.createdAt,
        expiresAt: sessionsTable.expiresAt,
        updatedAt: sessionsTable.updatedAt,
      })
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, userId))
      .orderBy(desc(sessionsTable.createdAt));

    return { data: sessions, error: null };
  } catch (error) {
    console.error("Failed to get user sessions:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_security_info = async (userId: string) => {
  if (!userId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const sessions = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, userId));

    const account = await db.query.accountsTable.findFirst({
      where: and(
        eq(accountsTable.userId, userId),
        eq(accountsTable.providerId, "credential")
      ),
      orderBy: desc(accountsTable.updatedAt),
    });

    return {
      data: {
        activeSessionCount: sessions.length,
        lastPasswordChange: account?.updatedAt || null,
        hasPassword: !!account?.password,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get security info:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const get_session_by_id = async (sessionId: string, userId: string) => {
  if (!sessionId || !userId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const session = await db.query.sessionsTable.findFirst({
      where: and(
        eq(sessionsTable.id, sessionId),
        eq(sessionsTable.userId, userId)
      ),
    });

    if (!session) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: session, error: null };
  } catch (error) {
    console.error("Failed to get session:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
