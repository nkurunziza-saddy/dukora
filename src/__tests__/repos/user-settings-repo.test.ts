import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { userSettingsTable, auditLogsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import { get_all, upsert } from "@/server/repos/user-settings-repo";

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    transaction: vi.fn((callback) => callback(db)),
  },
}));

describe("User Settings Repo", () => {
  const mockUserId = "user1";
  const mockBusinessId = "biz1";
  const mockSetting = {
    id: "setting1",
    userId: mockUserId,
    key: "theme",
    value: "dark",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get_all", () => {
    it("should return all user settings for a user", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockSetting]),
      });

      const result = await get_all(mockUserId);
      expect(result).toEqual({ data: [mockSetting], error: null });
      expect(db.select).toHaveBeenCalledWith();
      expect(db.select().from).toHaveBeenCalledWith(userSettingsTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        eq(userSettingsTable.userId, mockUserId)
      );
    });

    it("should return MISSING_INPUT if userId is missing", async () => {
      const result = await get_all("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_all(mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("upsert", () => {
    it("should upsert a user setting and create audit log", async () => {
      const newSettingData = {
        userId: mockUserId,
        key: "language",
        value: "en",
      };
      const upsertedSetting = { id: "newSetting", ...newSettingData };

      (db.insert as vi.Mock).mockImplementation((table) => {
        if (table === userSettingsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            onConflictDoUpdate: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([upsertedSetting]),
          };
        } else if (table === auditLogsTable) {
          return {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{}]),
          };
        }
        return {};
      });

      const result = await upsert(mockBusinessId, mockUserId, newSettingData);
      expect(result).toEqual({ data: upsertedSetting, error: null });
      expect(db.insert).toHaveBeenCalledWith(userSettingsTable);
      expect(db.insert).toHaveBeenCalledWith(auditLogsTable);
    });

    it("should return MISSING_INPUT if setting key is missing", async () => {
      const result = await upsert(mockBusinessId, mockUserId, {
        userId: mockUserId,
        key: "",
        value: "test",
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await upsert(mockBusinessId, mockUserId, mockSetting);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
