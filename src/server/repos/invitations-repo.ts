"use server";

import { addDays } from "date-fns";
import { and, eq, getTableColumns, inArray, isNull } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLogsTable, invitationsTable, usersTable } from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertInvitation,
} from "@/lib/schema/schema-types";
import { generateRandomCode } from "@/lib/utils/generate-random-code";
import { ErrorCode } from "@/server/constants/errors";

export const get_all = cache(async (businessId: string) => {
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
});

export const get_all_cached = unstable_cache(
  async (businessId: string) => get_all(businessId),
  ["invitations"],
  {
    revalidate: 300,
    tags: ["invitations"],
  },
);

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

export const get_by_id_cached = unstable_cache(
  async (invitationId: string, businessId: string) =>
    get_by_id(invitationId, businessId),
  ["invitations"],
  {
    revalidate: 300,
  },
);

export async function accept_invitation(
  code: string,
  action: "accept" | "decline",
) {
  if (!code) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  if (action !== "accept" && action !== "decline") {
    return { data: null, error: ErrorCode.INVALID_INPUT };
  }
  const invitation = await db.query.invitationsTable.findFirst({
    where: and(
      eq(invitationsTable.code, code),
      eq(invitationsTable.isAccepted, false),
      isNull(invitationsTable.deletedAt),
    ),
  });

  if (!invitation) {
    return { data: null, error: ErrorCode.INVITATION_NOT_FOUND };
  }

  if (invitation.expiresAt && new Date() > new Date(invitation.expiresAt)) {
    return { data: null, error: ErrorCode.INVITATION_EXPIRED };
  }
  try {
    if (action === "accept") {
      const existingUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, invitation.email),
      });

      if (existingUser) {
        await db
          .update(usersTable)
          .set({ businessId: invitation.businessId, role: invitation.role })
          .where(eq(usersTable.id, existingUser.id));

        await db
          .update(invitationsTable)
          .set({ isAccepted: true })
          .where(eq(invitationsTable.id, invitation.id));

        return { data: { redirect: "/dashboard" }, error: null };
      } else {
        return {
          data: {
            redirect: `/auth/set-password?email=${invitation.email}&invitationCode=${invitation.code}`,
          },
          error: null,
        };
      }
    } else if (action === "decline") {
      await db
        .update(invitationsTable)
        .set({ isAccepted: false })
        .where(eq(invitationsTable.id, invitation.id));

      return { data: { redirect: "/auth/sign-up" }, error: null };
    }
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create(
  businessId: string,
  userId: string,
  invitation: Omit<
    InsertInvitation,
    "code" | "expiresAt" | "isAccepted" | "invitedBy" | "businessId"
  >,
) {
  if (!invitation.email) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const existingUser = await db.query.usersTable.findFirst({
      where: and(
        eq(usersTable.email, invitation.email),
        eq(usersTable.businessId, businessId),
      ),
    });

    if (existingUser) {
      return { data: null, error: ErrorCode.USER_ALREADY_EXISTS };
    }

    const code = generateRandomCode();
    const expiresAt = addDays(new Date(), 7);

    const newInvitationData: InsertInvitation = {
      ...invitation,
      businessId,
      invitedBy: userId,
      code,
      expiresAt,
      isAccepted: false,
    };

    const result = await db.transaction(async (tx) => {
      const [newInvitation] = await tx
        .insert(invitationsTable)
        .values(newInvitationData)
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "invitation",
        recordId: newInvitation.id,
        action: "create-invitation",
        changes: JSON.stringify(newInvitationData),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return newInvitation;
    });

    revalidatePath("users");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function update(
  invitationId: string,
  businessId: string,
  userId: string,
  updates: Partial<InsertInvitation>,
) {
  if (!invitationId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [updatedInvitation] = await tx
        .update(invitationsTable)
        .set(updates)
        .where(
          and(
            eq(invitationsTable.id, invitationId),
            eq(invitationsTable.businessId, businessId),
            isNull(invitationsTable.deletedAt),
          ),
        )
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "invitation",
        recordId: updatedInvitation.id,
        action: "update-invitation",
        changes: JSON.stringify(updates),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return updatedInvitation;
    });

    if (!result) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND ?? ErrorCode.FAILED_REQUEST,
      };
    }

    revalidatePath("users");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to update invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(
  invitationId: string,
  businessId: string,
  userId: string,
) {
  if (!invitationId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const existingRecord = await db.query.invitationsTable.findFirst({
      where: eq(invitationsTable.id, invitationId),
    });
    if (!existingRecord) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }
    const result = await db.transaction(async (tx) => {
      const [deletedInvitation] = await tx
        .delete(invitationsTable)
        .where(
          and(
            eq(invitationsTable.id, invitationId),
            eq(invitationsTable.businessId, businessId),
          ),
        )
        .returning();

      const auditData: InsertAuditLog = {
        businessId: businessId,
        model: "invitation",
        recordId: invitationId,
        action: "delete-invitation",
        changes: JSON.stringify(existingRecord),
        performedBy: userId,
        performedAt: new Date(),
      };

      await tx.insert(auditLogsTable).values(auditData);
      return deletedInvitation;
    });

    if (!result) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND ?? ErrorCode.FAILED_REQUEST,
      };
    }

    revalidatePath("users");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to delete invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create_many(
  invitations: Omit<
    InsertInvitation,
    "id" | "code" | "expiresAt" | "isAccepted" | "invitedBy"
  >[],
) {
  if (!invitations || invitations.length === 0) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  const businessId = invitations[0]?.businessId;
  if (!businessId || !invitations.every((i) => i.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const emails = invitations.map((inv) => inv.email);
    const existingUsers = await db.query.usersTable.findMany({
      where: and(
        inArray(usersTable.email, emails),
        eq(usersTable.businessId, businessId),
      ),
    });

    if (existingUsers.length > 0) {
      return { data: null, error: ErrorCode.USER_ALREADY_EXISTS };
    }

    const newInvitationsData: InsertInvitation[] = invitations.map((inv) => {
      const code = generateRandomCode();
      const expiresAt = addDays(new Date(), 7);
      return {
        ...inv,
        code,
        expiresAt,
        isAccepted: false,
      };
    });

    const result = await db.transaction(async (tx) => {
      const insertedInvitations = await tx
        .insert(invitationsTable)
        .values(newInvitationsData)
        .returning();

      const auditLogs: InsertAuditLog[] = insertedInvitations.map((inv) => ({
        businessId: businessId,
        model: "invitation",
        recordId: inv.id,
        action: "create-invitation",
        changes: JSON.stringify(inv),
        performedBy: inv.invitedBy ?? "",
        performedAt: new Date(),
      }));

      await tx.insert(auditLogsTable).values(auditLogs);
      return insertedInvitations;
    });

    revalidatePath("users");

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create invitations:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function set_password_for_invitation(
  email: string,
  invitationCode: string,
  password: string,
) {
  if (!email || !invitationCode || !password) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const invitation = await db.query.invitationsTable.findFirst({
      where: and(
        eq(invitationsTable.code, invitationCode),
        eq(invitationsTable.email, email),
        eq(invitationsTable.isAccepted, false),
      ),
    });

    if (!invitation) {
      return { data: null, error: ErrorCode.INVITATION_NOT_FOUND };
    }

    if (invitation.expiresAt && new Date() > new Date(invitation.expiresAt)) {
      return { data: null, error: ErrorCode.INVITATION_EXPIRED };
    }

    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: invitation.name ?? "",
        lang: "fr",
      },
    });

    if (!signUpResult.user) {
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }

    await db
      .update(usersTable)
      .set({ businessId: invitation.businessId, role: invitation.role })
      .where(eq(usersTable.id, signUpResult.user.id));

    await db
      .update(invitationsTable)
      .set({ isAccepted: true })
      .where(eq(invitationsTable.id, invitation.id));

    return { data: { redirect: "/dashboard" }, error: null };
  } catch (error) {
    console.error("Failed to set password for invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
