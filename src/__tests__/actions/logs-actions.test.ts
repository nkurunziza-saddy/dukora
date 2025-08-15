import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
  getLogs,
  getLogsOverview,
  getLogById,
  createLog,
  deleteLog,
} from "@/server/actions/logs-actions";
import * as logsRepo from "@/server/repos/logs-repo";
import * as authActions from "@/server/actions/auth-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";

vi.mock("@/server/repos/logs-repo");
vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/helpers/role-permissions");

describe("Logs Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockLog = {
    id: "log-1",
    businessId: "biz-1",
    model: "product",
    recordId: "prod-1",
    action: "create",
    changes: "{}",
    performedBy: "user-1",
    performedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  });

  describe("getLogs", () => {
    it("should return logs if user has permission", async () => {
      (logsRepo.get_all_cached as Mock).mockResolvedValue({ data: [mockLog], error: null });

      const result = await getLogs();

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.LOG_VIEW
      );
      expect(logsRepo.get_all_cached).toHaveBeenCalledWith(mockUser.businessId, mockUser.id);
      expect(result).toEqual({ data: [mockLog], error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getLogs();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(logsRepo.get_all_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all_cached fails", async () => {
      (logsRepo.get_all_cached as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await getLogs();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getLogsOverview", () => {
    it("should return logs overview if user has permission", async () => {
      (logsRepo.get_overview as Mock).mockResolvedValue({ data: [mockLog], error: null });

      const result = await getLogsOverview();

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.LOG_VIEW
      );
      expect(logsRepo.get_overview).toHaveBeenCalledWith(mockUser.businessId, mockUser.id, undefined);
      expect(result).toEqual({ data: [mockLog], error: null });
    });

    it("should pass limit to get_overview", async () => {
      (logsRepo.get_overview as Mock).mockResolvedValue({ data: [mockLog], error: null });

      const limit = 5;
      await getLogsOverview(limit);

      expect(logsRepo.get_overview).toHaveBeenCalledWith(mockUser.businessId, mockUser.id, limit);
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getLogsOverview();

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(logsRepo.get_overview).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_overview fails", async () => {
      (logsRepo.get_overview as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await getLogsOverview();

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getLogById", () => {
    it("should return log by id if user has permission", async () => {
      (logsRepo.get_by_id as Mock).mockResolvedValue({ data: mockLog, error: null });

      const result = await getLogById(mockLog.id);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.LOG_VIEW
      );
      expect(logsRepo.get_by_id).toHaveBeenCalledWith(mockLog.id, mockUser.businessId);
      expect(result).toEqual({ data: mockLog, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getLogById(mockLog.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(logsRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return missing input error if auditLogId is empty", async () => {
      const result = await getLogById(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(logsRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_id fails", async () => {
      (logsRepo.get_by_id as Mock).mockResolvedValue({ data: null, error: ErrorCode.NOT_FOUND });

      const result = await getLogById(mockLog.id);

      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });
  });

  describe("createLog", () => {
    const newLogData = {
      model: "user",
      recordId: "user-2",
      action: "update",
      changes: "{}",
    };

    it("should create a log successfully", async () => {
      (logsRepo.create as Mock).mockResolvedValue({ data: mockLog, error: null });

      const result = await createLog(newLogData);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.LOG_CREATE
      );
      expect(logsRepo.create).toHaveBeenCalledWith(
        mockUser.businessId,
        mockUser.id,
        {
          ...newLogData,
          businessId: mockUser.businessId,
          performedBy: mockUser.id,
        }
      );
      expect(result).toEqual({ data: mockLog, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await createLog(newLogData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(logsRepo.create).not.toHaveBeenCalled();
    });

    it("should return error from repo if create fails", async () => {
      (logsRepo.create as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await createLog(newLogData);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("deleteLog", () => {
    it("should delete a log successfully", async () => {
      (logsRepo.remove as Mock).mockResolvedValue({ data: { success: true }, error: null });

      const result = await deleteLog(mockLog.id);

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.LOG_DELETE
      );
      expect(logsRepo.remove).toHaveBeenCalledWith(mockLog.id, mockUser.businessId);
      expect(result).toEqual({ data: { success: true }, error: null });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await deleteLog(mockLog.id);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(logsRepo.remove).not.toHaveBeenCalled();
    });

    it("should return missing input error if auditLogId is empty", async () => {
      const result = await deleteLog(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(logsRepo.remove).not.toHaveBeenCalled();
    });

    it("should return error from repo if remove fails", async () => {
      (logsRepo.remove as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await deleteLog(mockLog.id);

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });
});
