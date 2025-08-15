import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authActions from "@/server/actions/auth-actions";
import * as userSettingsActions from "@/server/actions/user-settings-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import * as userSettingsRepo from "@/server/repos/user-settings-repo";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";

vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/repos/user-settings-repo");
vi.mock("@/server/helpers/role-permissions");

describe("User Settings Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockSetting = {
    id: "setting-1",
    userId: "user-1",
    key: "theme",
    value: "dark",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as vi.Mock).mockResolvedValue({
      user: mockUser,
    });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  });

  describe("getUserSettings", () => {
    it("should return user settings if user has permission", async () => {
      (userSettingsRepo.get_all_cached as vi.Mock).mockResolvedValue({
        data: [mockSetting],
        error: null,
      });

      const result = await userSettingsActions.getUserSettings();

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.USER_VIEW
      );
      expect(userSettingsRepo.get_all_cached).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ data: [mockSetting], error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await userSettingsActions.getUserSettings();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(userSettingsRepo.get_all_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all_cached fails", async () => {
      (userSettingsRepo.get_all_cached as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await userSettingsActions.getUserSettings();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("upsertUserSettings", () => {
    const settingsToUpsert = [
      { key: "theme", value: "light" },
      { key: "language", value: "en" },
    ];

    it("should upsert user settings successfully", async () => {
      (userSettingsRepo.upsert as vi.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await userSettingsActions.upsertUserSettings(
        settingsToUpsert
      );

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.USER_UPDATE
      );
      expect(userSettingsRepo.upsert).toHaveBeenCalledTimes(
        settingsToUpsert.length
      );
      expect(userSettingsRepo.upsert).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.businessId,
        expect.objectContaining({
          key: "theme",
          value: "light",
          userId: mockUser.id,
          updatedAt: expect.any(Date),
        })
      );
      expect(userSettingsRepo.upsert).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.businessId,
        expect.objectContaining({
          key: "language",
          value: "en",
          userId: mockUser.id,
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toEqual({ data: { success: true }, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await userSettingsActions.upsertUserSettings(
        settingsToUpsert
      );

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(userSettingsRepo.upsert).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if settingsData is empty", async () => {
      const result = await userSettingsActions.upsertUserSettings([]);

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(userSettingsRepo.upsert).not.toHaveBeenCalled();
    });

    it("should return FAILED_REQUEST if any upsert fails", async () => {
      (userSettingsRepo.upsert as vi.Mock)
        .mockResolvedValueOnce({ data: { success: true }, error: null })
        .mockResolvedValueOnce({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await userSettingsActions.upsertUserSettings(
        settingsToUpsert
      );

      expect(result.error).toBe(ErrorCode.FAILED_REQUEST);
      expect(result.data).toBeNull();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe(ErrorCode.DATABASE_ERROR);
    });
  });
});
