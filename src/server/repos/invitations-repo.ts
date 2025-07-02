"use server";

import { eq, and } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { auditLogsTable, invitationsTable } from "@/lib/schema";
import type {
  InsertAuditLog,
  InsertInvitation,
} from "@/lib/schema/schema-types";
import { ErrorCode } from "@/server/constants/errors";
import { generateRandomCode } from "@/lib/utils/generate-random-code";
import { addDays } from "date-fns";
import { usersTable } from "@/lib/schema";

export async function getAll(businessId: string) {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const invitations = await db.query.invitationsTable.findMany({
      where: eq(invitationsTable.businessId, businessId),
      with: {
        invitedByUser: true,
      },
    });
    return { data: invitations, error: null };
  } catch (error) {
    console.error("Failed to fetch invitations:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const getAllCached = async (businessId: string) =>
  unstable_cache(
    async () => await getAll(businessId),
    ["invitations", businessId],
    {
      revalidate: 300,
      tags: [`invitations-${businessId}`],
    }
  );

export async function getById(invitationId: string, businessId: string) {
  if (!invitationId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const invitation = await db.query.invitationsTable.findFirst({
      where: and(
        eq(invitationsTable.id, invitationId),
        eq(invitationsTable.businessId, businessId)
      ),
    });

    if (!invitation) {
      return {
        data: null,
        error: ErrorCode.NOT_FOUND ?? ErrorCode.FAILED_REQUEST,
      };
    }

    return { data: invitation, error: null };
  } catch (error) {
    console.error("Failed to fetch invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export const getByIdCached = async (invitationId: string, businessId: string) =>
  unstable_cache(
    async () => await getById(invitationId, businessId),
    ["invitations", invitationId, businessId],
    {
      revalidate: 300,
      tags: [`invitations-${businessId}`, `invitation-${invitationId}`],
    }
  );



export async function create(
  businessId: string,
  userId: string,
  invitation: Omit<InsertInvitation, "code" | "expiresAt" | "isAccepted" | "invitedBy" | "businessId">
) {
  if (!invitation.email) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const existingUser = await db.query.usersTable.findFirst({
      where: and(eq(usersTable.email, invitation.email), eq(usersTable.businessId, businessId)),
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

    revalidateTag("invitations");
    revalidateTag(`invitations-${businessId}`);

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
  updates: Partial<InsertInvitation>
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
            eq(invitationsTable.businessId, businessId)
          )
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

    revalidateTag(`invitations-${businessId}`);
    revalidateTag(`invitation-${invitationId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to update invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function remove(
  invitationId: string,
  businessId: string,
  userId: string
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
            eq(invitationsTable.businessId, businessId)
          )
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

    revalidateTag(`invitations-${businessId}`);
    revalidateTag(`invitation-${invitationId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to delete invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createMany(invitations: InsertInvitation[]) {
  if (invitations === null) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  const businessId = invitations[0]?.businessId;
  if (!businessId || !invitations.every((i) => i.businessId === businessId)) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await db
      .insert(invitationsTable)
      .values(invitations)
      .returning();

    revalidateTag(`invitations-${businessId}`);

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to create invitations:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
