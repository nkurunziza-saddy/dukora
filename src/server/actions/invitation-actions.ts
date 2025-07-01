"use server";

import type { InsertInvitation } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import {
  getAll as getAllInvitationsRepo,
  getById as getInvitationByIdRepo,
  create as createInvitationRepo,
  update as updateInvitationRepo,
  remove as removeInvitationRepo,
  createMany as createManyInvitationsRepo,
} from "../repos/invitations-repo";

export async function getInvitations() {
  const currentUser = await getUserIfHasPermission(Permission.INVITATION_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  try {
    const invitations = await getAllInvitationsRepo(currentUser.businessId!);
    if (invitations.error) {
      return { data: null, error: invitations.error };
    }
    return { data: invitations.data, error: null };
  } catch (error) {
    console.error("Error getting invitations:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function getInvitationById(invitationId: string) {
  const currentUser = await getUserIfHasPermission(Permission.INVITATION_VIEW);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!invitationId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const invitation = await getInvitationByIdRepo(
      invitationId,
      currentUser.businessId!
    );

    if (invitation.error) {
      return { data: null, error: invitation.error };
    }

    return { data: invitation.data, error: null };
  } catch (error) {
    console.error("Error getting invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createInvitation(
  invitationData: Omit<InsertInvitation, "businessId" | "id">
) {
  const currentUser = await getUserIfHasPermission(
    Permission.INVITATION_CREATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!invitationData.email?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const invitation: InsertInvitation = {
      ...invitationData,
      businessId: currentUser.businessId!,
    };

    const res = await createInvitationRepo(
      currentUser.businessId!,
      currentUser.id,
      invitation
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`invitations-${currentUser.businessId!}`);

    return { data: res.data, error: null };
  } catch (error) {
    console.error("Error creating invitation:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function updateInvitation(
  invitationId: string,
  updates: Partial<Omit<InsertInvitation, "id" | "businessId">>
) {
  const currentUser = await getUserIfHasPermission(
    Permission.INVITATION_UPDATE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!invitationId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const updatedInvitation = await updateInvitationRepo(
      invitationId,
      currentUser.businessId!,
      currentUser.id,
      updates
    );
    if (updatedInvitation.error) {
      return { data: null, error: updatedInvitation.error };
    }

    revalidateTag(`invitations-${currentUser.businessId!}`);
    revalidateTag(`invitation-${invitationId}`);

    return { data: updatedInvitation.data, error: null };
  } catch (error) {
    console.error("Error updating invitation:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function deleteInvitation(invitationId: string) {
  const currentUser = await getUserIfHasPermission(
    Permission.INVITATION_DELETE
  );
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (!invitationId?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const res = await removeInvitationRepo(
      invitationId,
      currentUser.businessId!,
      currentUser.id
    );

    if (res.error) {
      return { data: null, error: res.error };
    }

    revalidateTag(`invitations-${currentUser.businessId!}`);
    revalidateTag(`invitation-${invitationId}`);

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Error deleting invitation:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function createManyInvitations(
  invitationsData: Omit<InsertInvitation, "businessId" | "id">[]
) {
  const currentUser = await getUserIfHasPermission(
    Permission.INVITATION_CREATE
  );
  console.log(currentUser);
  if (!currentUser) return { data: null, error: ErrorCode.UNAUTHORIZED };

  if (invitationsData === null) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const invitations: InsertInvitation[] = invitationsData.map(
      (invitation) => ({
        ...invitation,
        businessId: currentUser.businessId!,
      })
    );
    console.log({ invitations });
    const createdInvitations = await createManyInvitationsRepo(invitations);

    if (createdInvitations.error) {
      return { data: null, error: createdInvitations.error };
    }

    revalidateTag(`invitations-${currentUser.businessId!}`);

    return { data: createdInvitations.data, error: null };
  } catch (error) {
    console.error("Error creating invitations:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
