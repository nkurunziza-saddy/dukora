import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
  getBusinessSettings,
  upsertBusinessSettings,
  upsertManyBusinessSettings,
} from "@/server/actions/business-settings-actions";
import * as businessSettingsRepo from "@/server/repos/business-settings-repo";
import * as authActions from "@/server/actions/auth-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";

vi.mock("@/server/repos/business-settings-repo");
vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/helpers/role-permissions");

describe("Business Settings Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockSettings = [
    { id: "setting-1", key: "theme", value: "dark", businessId: "biz-1" },
    { id: "setting-2", key: "currency", value: "USD", businessId: "biz-1" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  });

  describe("getBusinessSettings", () => {
    it("should return business settings if user has permission", async () => {
      (businessSettingsRepo.get_all_cached as Mock).mockResolvedValue({ data: mockSettings, error: null });

      const result = await getBusinessSettings();

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.BUSINESS_SETTINGS_VIEW
      );
      expect(businessSettingsRepo.get_all_cached).toHaveBeenCalledWith(mockUser.businessId);
      expect(result).toEqual({ data: mockSettings, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getBusinessSettings();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(businessSettingsRepo.get_all_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all_cached fails", async () => {
      (businessSettingsRepo.get_all_cached as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await getBusinessSettings();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("upsertBusinessSettings", () => {
    const settingsToUpsert = [
      { key: "theme", value: "light" },
      { key: "language", value: "en" },
    ];

    it("should upsert business settings successfully", async () => {
      (businessSettingsRepo.upsert as Mock).mockResolvedValue({ data: { success: true }, error: null });

      const result = await upsertBusinessSettings(settingsToUpsert);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.BUSINESS_SETTINGS_UPDATE
      );
      expect(businessSettingsRepo.upsert).toHaveBeenCalledTimes(settingsToUpsert.length);
      expect(businessSettingsRepo.upsert).toHaveBeenCalledWith(
        mockUser.businessId,
        mockUser.id,
        expect.objectContaining({ key: "theme", value: "light", businessId: mockUser.businessId })
      );
      expect(businessSettingsRepo.upsert).toHaveBeenCalledWith(
        mockUser.businessId,
        mockUser.id,
        expect.objectContaining({ key: "language", value: "en", businessId: mockUser.businessId })
      );
      expect(result).toEqual({ data: { success: true }, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await upsertBusinessSettings(settingsToUpsert);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(businessSettingsRepo.upsert).not.toHaveBeenCalled();
    });

    it("should return missing input error if settingsData is empty", async () => {
      const result = await upsertBusinessSettings([]);

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(businessSettingsRepo.upsert).not.toHaveBeenCalled();
    });

    it("should return FAILED_REQUEST if any upsert fails", async () => {
      (businessSettingsRepo.upsert as Mock)
        .mockResolvedValueOnce({ data: { success: true }, error: null })
        .mockResolvedValueOnce({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await upsertBusinessSettings(settingsToUpsert);

      expect(result.error).toBe(ErrorCode.FAILED_REQUEST);
      expect(result.data).toBeNull();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe(ErrorCode.DATABASE_ERROR);
    });
  });

  describe("upsertManyBusinessSettings", () => {
    const settingsToUpsertMany = [
      { key: "timezone", value: "GMT" },
      { key: "dateFormat", value: "YYYY-MM-DD" },
    ];

    it("should upsert many business settings successfully", async () => {
      (businessSettingsRepo.upsert_many as Mock).mockResolvedValue({ data: settingsToUpsertMany, error: null });

      const result = await upsertManyBusinessSettings(settingsToUpsertMany);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.BUSINESS_SETTINGS_CREATE
      );
      expect(businessSettingsRepo.upsert_many).toHaveBeenCalledWith(
        mockUser.id,
        expect.arrayContaining([
          expect.objectContaining({ key: "timezone", value: "GMT", businessId: mockUser.businessId }),
          expect.objectContaining({ key: "dateFormat", value: "YYYY-MM-DD", businessId: mockUser.businessId }),
        ])
      );
      expect(result).toEqual({ data: settingsToUpsertMany, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await upsertManyBusinessSettings(settingsToUpsertMany);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(businessSettingsRepo.upsert_many).not.toHaveBeenCalled();
    });

    it("should return missing input error if settingsData is null", async () => {
      const result = await upsertManyBusinessSettings(null as any);

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(businessSettingsRepo.upsert_many).not.toHaveBeenCalled();
    });

    it("should return error from repo if upsert_many fails", async () => {
      (businessSettingsRepo.upsert_many as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await upsertManyBusinessSettings(settingsToUpsertMany);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });
});
