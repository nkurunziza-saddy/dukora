"use server";

import type { InsertInvitation } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidateTag } from "next/cache";
import { createProtectedAction } from "@/server/helpers/action-factory";
import {
  getAll as getAllInvitationsRepo,
  getById as getInvitationByIdRepo,
  create as createInvitationRepo,
  update as updateInvitationRepo,
  remove as removeInvitationRepo,
  createMany as createManyInvitationsRepo,
} from "../repos/invitations-repo";

export const getInvitations = createProtectedAction(
  Permission.INVITATION_VIEW,
  async (user) => {
    const invitations = await getAllInvitationsRepo(user.businessId!);
    if (invitations.error) {
      return { data: null, error: invitations.error };
    }
    return { data: invitations.data, error: null };
  }
);

export const getInvitationById = createProtectedAction(
  Permission.INVITATION_VIEW,
  async (user, invitationId: string) => {
    if (!invitationId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const invitation = await getInvitationByIdRepo(
      invitationId,
      user.businessId!
    );
    if (invitation.error) {
      return { data: null, error: invitation.error };
    }
    return { data: invitation.data, error: null };
  }
);

export const createInvitation = createProtectedAction(
  Permission.INVITATION_CREATE,
  async (user, invitationData: Omit<InsertInvitation, "businessId" | "id">) => {
    if (!invitationData.email?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const invitation: InsertInvitation = {
      ...invitationData,
      businessId: user.businessId!,
    };
    const res = await createInvitationRepo(user.businessId!, user.id, invitation);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`invitations-${user.businessId!}`);
    return { data: res.data, error: null };
  }
);

export const updateInvitation = createProtectedAction(
  Permission.INVITATION_UPDATE,
  async (
    user,
    { 
      invitationId,
      updates,
    }: {
      invitationId: string;
      updates: Partial<Omit<InsertInvitation, "id" | "businessId">>;
    }
  ) => {
    if (!invitationId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedInvitation = await updateInvitationRepo(
      invitationId,
      user.businessId!,
      user.id,
      updates
    );
    if (updatedInvitation.error) {
      return { data: null, error: updatedInvitation.error };
    }
    revalidateTag(`invitations-${user.businessId!}`);
    revalidateTag(`invitation-${invitationId}`);
    return { data: updatedInvitation.data, error: null };
  }
);

export const deleteInvitation = createProtectedAction(
  Permission.INVITATION_DELETE,
  async (user, invitationId: string) => {
    if (!invitationId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const res = await removeInvitationRepo(
      invitationId,
      user.businessId!,
      user.id
    );
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidateTag(`invitations-${user.businessId!}`);
    revalidateTag(`invitation-${invitationId}`);
    return { data: { success: true }, error: null };
  }
);

export const createManyInvitations = createProtectedAction(
  Permission.INVITATION_CREATE,
  async (
    user,
    invitationsData: Omit<InsertInvitation, "businessId" | "id">[]
  ) => {
    if (invitationsData === null) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const invitations: InsertInvitation[] = invitationsData.map(
      (invitation) => ({
        ...invitation,
        businessId: user.businessId!,
      })
    );
    const createdInvitations = await createManyInvitationsRepo(invitations);
    if (createdInvitations.error) {
      return { data: null, error: createdInvitations.error };
    }
    revalidateTag(`invitations-${user.businessId!}`);
    return { data: createdInvitations.data, error: null };
  }
);
