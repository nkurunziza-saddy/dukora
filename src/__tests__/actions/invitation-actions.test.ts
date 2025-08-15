import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
  getInvitations,
  getInvitationById,
  createInvitation,
  updateInvitation,
  deleteInvitation,
  createManyInvitations,
  acceptInvitation,
  setPasswordForInvitation,
} from "@/server/actions/invitation-actions";
import * as invitationRepo from "@/server/repos/invitations-repo";
import * as businessRepo from "@/server/repos/business-repo";
import * as authActions from "@/server/actions/auth-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/email";
import { render } from "@react-email/render";
import { redirect } from "next/navigation";

vi.mock("@/server/repos/invitations-repo");
vi.mock("@/server/repos/business-repo");
vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/helpers/role-permissions");
vi.mock("next/cache", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    revalidatePath: vi.fn(),
  };
});
vi.mock("@/lib/email", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));
vi.mock("@react-email/render", () => ({
  render: vi.fn(() => "<html>Mock Email</html>"),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const originalEnv = process.env;
process.env = {
  ...originalEnv,
  NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
};

describe("Invitation Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockInvitation = {
    id: "inv-1",
    email: "invite@example.com",
    role: "MEMBER",
    businessId: "biz-1",
    invitedBy: "user-1",
    code: "mockcode123",
    expiresAt: new Date(Date.now() + 86400000),
    isAccepted: false,
  };

  const mockBusiness = {
    id: "biz-1",
    name: "Test Business",
    businessType: "Retail",
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as Mock).mockResolvedValue({
      user: mockUser,
    });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
    (businessRepo.get_by_id_cached as Mock).mockResolvedValue({
      data: mockBusiness,
      error: null,
    });
  });

  describe("getInvitations", () => {
    it("should return invitations if user has permission", async () => {
      (invitationRepo.get_all_cached as Mock).mockResolvedValue({
        data: [mockInvitation],
        error: null,
      });

      const result = await getInvitations();

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.INVITATION_VIEW
      );
      expect(invitationRepo.get_all_cached).toHaveBeenCalledWith(
        mockUser.businessId
      );
      expect(result).toEqual({ data: [mockInvitation], error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getInvitations();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(invitationRepo.get_all_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all_cached fails", async () => {
      (invitationRepo.get_all_cached as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await getInvitations();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getInvitationById", () => {
    it("should return invitation by id if user has permission", async () => {
      (invitationRepo.get_by_id as Mock).mockResolvedValue({
        data: mockInvitation,
        error: null,
      });

      const result = await getInvitationById(mockInvitation.id);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.INVITATION_VIEW
      );
      expect(invitationRepo.get_by_id).toHaveBeenCalledWith(
        mockInvitation.id,
        mockUser.businessId
      );
      expect(result).toEqual({ data: mockInvitation, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getInvitationById(mockInvitation.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(invitationRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return missing input error if invitationId is empty", async () => {
      const result = await getInvitationById(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(invitationRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_id fails", async () => {
      (invitationRepo.get_by_id as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.NOT_FOUND,
      });

      const result = await getInvitationById(mockInvitation.id);

      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });
  });

  describe("createInvitation", () => {
    const newInvitationData = {
      email: "new@example.com",
      role: "MEMBER",
      name: "New Invitee",
    };

    it("should create an invitation successfully and send email", async () => {
      (invitationRepo.create as Mock).mockResolvedValue({
        data: mockInvitation,
        error: null,
      });
      (resend.emails.send as Mock).mockResolvedValue({ id: "email-1" });

      const result = await createInvitation(newInvitationData);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.INVITATION_CREATE
      );
      expect(invitationRepo.create).toHaveBeenCalledWith(
        mockUser.businessId,
        mockUser.id,
        newInvitationData
      );
      expect(businessRepo.get_by_id_cached).toHaveBeenCalledWith(
        mockUser.businessId
      );
      expect(render).toHaveBeenCalled();
      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: newInvitationData.email,
          subject: `Join ${mockBusiness.name} on Quantura`,
          html: "<html>Mock Email</html>",
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith("users");
      expect(result).toEqual({ data: mockInvitation, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await createInvitation(newInvitationData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(invitationRepo.create).not.toHaveBeenCalled();
    });

    it("should return missing input error if email is empty", async () => {
      const result = await createInvitation({
        ...newInvitationData,
        email: " ",
      });

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(invitationRepo.create).not.toHaveBeenCalled();
    });

    it("should return error from repo if create fails", async () => {
      (invitationRepo.create as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await createInvitation(newInvitationData);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });

    it("should return FAILED_REQUEST if business not found", async () => {
      (invitationRepo.create as Mock).mockResolvedValue({
        data: mockInvitation,
        error: null,
      });
      (businessRepo.get_by_id_cached as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.NOT_FOUND,
      });

      const result = await createInvitation(newInvitationData);

      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });

    it("should return FAILED_REQUEST if email sending fails", async () => {
      (invitationRepo.create as Mock).mockResolvedValue({
        data: mockInvitation,
        error: null,
      });
      (resend.emails.send as Mock).mockRejectedValue(
        new Error("Email send failed")
      );

      const result = await createInvitation(newInvitationData);

      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("updateInvitation", () => {
    const updates = { role: "ADMIN" };

    it("should update an invitation successfully", async () => {
      (invitationRepo.update as Mock).mockResolvedValue({
        data: { ...mockInvitation, ...updates },
        error: null,
      });

      const result = await updateInvitation({
        invitationId: mockInvitation.id,
        updates,
      });

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.INVITATION_UPDATE
      );
      expect(invitationRepo.update).toHaveBeenCalledWith(
        mockInvitation.id,
        mockUser.businessId,
        mockUser.id,
        updates
      );
      expect(revalidatePath).toHaveBeenCalledWith("users");
      expect(result).toEqual({
        data: { ...mockInvitation, ...updates },
        error: null,
      });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await updateInvitation({
        invitationId: mockInvitation.id,
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(invitationRepo.update).not.toHaveBeenCalled();
    });

    it("should return missing input error if invitationId is empty", async () => {
      const result = await updateInvitation({ invitationId: " ", updates });

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(invitationRepo.update).not.toHaveBeenCalled();
    });

    it("should return error from repo if update fails", async () => {
      (invitationRepo.update as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await updateInvitation({
        invitationId: mockInvitation.id,
        updates,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("deleteInvitation", () => {
    it("should delete an invitation successfully", async () => {
      (invitationRepo.remove as Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await deleteInvitation(mockInvitation.id);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.INVITATION_DELETE
      );
      expect(invitationRepo.remove).toHaveBeenCalledWith(
        mockInvitation.id,
        mockUser.businessId,
        mockUser.id
      );
      expect(revalidatePath).toHaveBeenCalledWith("users");
      expect(result).toEqual({ data: { success: true }, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await deleteInvitation(mockInvitation.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(invitationRepo.remove).not.toHaveBeenCalled();
    });

    it("should return missing input error if invitationId is empty", async () => {
      const result = await deleteInvitation(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(invitationRepo.remove).not.toHaveBeenCalled();
    });

    it("should return error from repo if remove fails", async () => {
      (invitationRepo.remove as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await deleteInvitation(mockInvitation.id);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("createManyInvitations", () => {
    const newInvitationsData = [
      { email: "new1@example.com", role: "MEMBER", name: "Invitee 1" },
      { email: "new2@example.com", role: "VIEW_ONLY", name: "Invitee 2" },
    ];

    it("should create many invitations successfully and send emails", async () => {
      (invitationRepo.create_many as Mock).mockResolvedValue({
        data: newInvitationsData,
        error: null,
      });
      (resend.emails.send as Mock).mockResolvedValue({ id: "email-batch-1" });

      const result = await createManyInvitations(newInvitationsData);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.INVITATION_CREATE
      );
      expect(invitationRepo.create_many).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            email: "new1@example.com",
            businessId: mockUser.businessId,
          }),
          expect.objectContaining({
            email: "new2@example.com",
            businessId: mockUser.businessId,
          }),
        ])
      );
      expect(businessRepo.get_by_id_cached).toHaveBeenCalledWith(
        mockUser.businessId
      );
      expect(render).toHaveBeenCalledTimes(newInvitationsData.length);
      expect(resend.emails.send).toHaveBeenCalledTimes(
        newInvitationsData.length
      );
      expect(revalidatePath).toHaveBeenCalledWith("users");
      expect(result).toEqual({ data: newInvitationsData, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await createManyInvitations(newInvitationsData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(invitationRepo.create_many).not.toHaveBeenCalled();
    });

    it("should return missing input error if invitationsData is null", async () => {
      const result = await createManyInvitations(null as any);

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(invitationRepo.create_many).not.toHaveBeenCalled();
    });

    it("should return error from repo if create_many fails", async () => {
      (invitationRepo.create_many as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await createManyInvitations(newInvitationsData);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });

    it("should return FAILED_REQUEST if business not found", async () => {
      (invitationRepo.create_many as Mock).mockResolvedValue({
        data: newInvitationsData,
        error: null,
      });
      (businessRepo.get_by_id_cached as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.NOT_FOUND,
      });

      const result = await createManyInvitations(newInvitationsData);

      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });

    it("should log error if email sending fails for one invitation but continue", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (invitationRepo.create_many as Mock).mockResolvedValue({
        data: newInvitationsData,
        error: null,
      });
      (resend.emails.send as Mock)
        .mockResolvedValueOnce({ id: "email-1" })
        .mockRejectedValueOnce(new Error("Email send failed for invitee 2"));

      const result = await createManyInvitations(newInvitationsData);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Failed to send invitation email to new2@example.com"
        ),
        expect.any(Error)
      );
      expect(result).toEqual({ data: newInvitationsData, error: null }); // Should still return data
      consoleErrorSpy.mockRestore();
    });
  });

  describe("acceptInvitation", () => {
    it("should redirect to dashboard on successful acceptance", async () => {
      (invitationRepo.accept_invitation as Mock).mockResolvedValue({
        data: { redirect: "/dashboard" },
        error: null,
      });

      await acceptInvitation({ code: mockInvitation.code, action: "accept" });

      expect(invitationRepo.accept_invitation).toHaveBeenCalledWith(
        mockInvitation.code,
        "accept"
      );
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("should redirect to home on failed acceptance (repo error)", async () => {
      (invitationRepo.accept_invitation as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.INVITATION_EXPIRED,
      });

      await acceptInvitation({ code: mockInvitation.code, action: "accept" });

      expect(invitationRepo.accept_invitation).toHaveBeenCalledWith(
        mockInvitation.code,
        "accept"
      );
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("should redirect to home if repo returns null", async () => {
      (invitationRepo.accept_invitation as Mock).mockResolvedValue(null);

      await acceptInvitation({ code: mockInvitation.code, action: "accept" });

      expect(invitationRepo.accept_invitation).toHaveBeenCalledWith(
        mockInvitation.code,
        "accept"
      );
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("should redirect to home on invalid action", async () => {
      (invitationRepo.accept_invitation as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.INVALID_INPUT,
      });

      await acceptInvitation({
        code: mockInvitation.code,
        action: "invalid" as any,
      });

      expect(redirect).toHaveBeenCalledWith("/");
    });
  });

  describe("setPasswordForInvitation", () => {
    const passwordData = {
      email: mockInvitation.email,
      invitationCode: mockInvitation.code,
      password: "newPassword123",
    };

    it("should redirect to dashboard on successful password set", async () => {
      (invitationRepo.set_password_for_invitation as Mock).mockResolvedValue({
        data: { redirect: "/dashboard" },
        error: null,
      });

      await setPasswordForInvitation(passwordData);

      expect(invitationRepo.set_password_for_invitation).toHaveBeenCalledWith(
        passwordData.email,
        passwordData.invitationCode,
        passwordData.password
      );
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("should redirect to home on failed password set (repo error)", async () => {
      (invitationRepo.set_password_for_invitation as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.FAILED_REQUEST,
      });

      await setPasswordForInvitation(passwordData);

      expect(invitationRepo.set_password_for_invitation).toHaveBeenCalledWith(
        passwordData.email,
        passwordData.invitationCode,
        passwordData.password
      );
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("should redirect to home if repo returns null", async () => {
      (invitationRepo.set_password_for_invitation as Mock).mockResolvedValue(
        null
      );

      await setPasswordForInvitation(passwordData);

      expect(invitationRepo.set_password_for_invitation).toHaveBeenCalledWith(
        passwordData.email,
        passwordData.invitationCode,
        passwordData.password
      );
      expect(redirect).toHaveBeenCalledWith("/");
    });
  });
});
