import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import { eq, and, isNull } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  get_all,
  get_by_id,
  create,
  update,
  remove,
  toggle_active,
} from "@/server/repos/user-repo";

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    query: {
      usersTable: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    transaction: vi.fn().mockImplementation(async (callback) => {
      return await callback(db);
    }),
  },
}));

describe("User Repo", () => {
  const mockBusinessId = "biz1";
  const mockUser = {
    id: "user1",
    email: "test@example.com",
    name: "Test User",
    businessId: mockBusinessId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(crypto, "randomUUID").mockReturnValue("mock-uuid");
  });

  describe("get_all", () => {
    it("should return all users for a business", async () => {
      const selectMock = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockUser]),
      };
      (db.select as vi.Mock).mockReturnValue(selectMock);

      const result = await get_all(mockBusinessId);
      expect(result).toEqual({ data: [mockUser], error: null });
      expect(db.select).toHaveBeenCalledWith();
      expect(selectMock.from).toHaveBeenCalledWith(usersTable);
      expect(selectMock.where).toHaveBeenCalledWith(
        and(
          eq(usersTable.businessId, mockBusinessId),
          isNull(usersTable.deletedAt)
        )
      );
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await get_all("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_all(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_by_id", () => {
    it("should return a user by ID", async () => {
      (db.query.usersTable.findFirst as vi.Mock).mockResolvedValue(mockUser);

      const result = await get_by_id(mockUser.id, mockBusinessId);
      expect(result).toEqual({ data: mockUser, error: null });
      expect(db.query.usersTable.findFirst).toHaveBeenCalledWith({
        where: and(
          eq(usersTable.id, mockUser.id),
          eq(usersTable.businessId, mockBusinessId),
          isNull(usersTable.deletedAt)
        ),
        with: expect.any(Object),
      });
    });

    it("should return MISSING_INPUT if userId or businessId is missing", async () => {
      let result = await get_by_id("", mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await get_by_id(mockUser.id, "");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return USER_NOT_FOUND if user is not found", async () => {
      (db.query.usersTable.findFirst as vi.Mock).mockResolvedValue(undefined);

      const result = await get_by_id(mockUser.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.USER_NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.usersTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await get_by_id(mockUser.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const newUserData = {
        email: "new@example.com",
        name: "New User",
        businessId: mockBusinessId,
      };
      const createdUser = {
        ...newUserData,
        id: "mock-uuid",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      (db.insert as vi.Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdUser]),
      });

      const result = await create(newUserData);
      expect(result.data).toEqual(createdUser);
      expect(result.error).toBeNull();
      expect(db.insert).toHaveBeenCalledWith(usersTable);
      expect(db.insert().values).toHaveBeenCalledWith(
        expect.objectContaining({
          ...newUserData,
          id: "mock-uuid",
        })
      );
    });

    it("should return MISSING_INPUT if required fields are missing", async () => {
      let result = await create({
        email: "",
        name: "New User",
        businessId: mockBusinessId,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create({
        email: "new@example.com",
        name: "",
        businessId: mockBusinessId,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create({
        email: "new@example.com",
        name: "New User",
        businessId: "",
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await create({
        email: "new@example.com",
        name: "New User",
        businessId: mockBusinessId,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("update", () => {
    it("should update an existing user", async () => {
      const updates = { name: "Updated Name" };
      const updatedUser = { ...mockUser, ...updates };

      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedUser]),
      });

      const result = await update(mockUser.id, updates, mockBusinessId);
      expect(result).toEqual({ data: updatedUser, error: null });
      expect(db.update).toHaveBeenCalledWith(usersTable);
      expect(db.update().set).toHaveBeenCalledWith(
        expect.objectContaining(updates)
      );
    });

    it("should return MISSING_INPUT if userId or businessId is missing", async () => {
      let result = await update("", {}, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await update(mockUser.id, {}, "");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return USER_NOT_FOUND if user to update is not found", async () => {
      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]), // No user found
      });

      const result = await update(mockUser.id, {}, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.USER_NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.update as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await update(mockUser.id, {}, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("remove", () => {
    it("should soft delete a user", async () => {
      const deletedUser = { ...mockUser, deletedAt: expect.any(Date) };
      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([deletedUser]),
      });

      const result = await remove(mockUser.id, mockBusinessId);
      expect(result).toEqual({ data: deletedUser, error: null });
      expect(db.update).toHaveBeenCalledWith(usersTable);
      expect(db.update().set).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedAt: expect.any(Date),
        })
      );
    });

    it("should return MISSING_INPUT if userId or businessId is missing", async () => {
      let result = await remove("", mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await remove(mockUser.id, "");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return USER_NOT_FOUND if user to delete is not found", async () => {
      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]), // No user found
      });

      const result = await remove(mockUser.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.USER_NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.update as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await remove(mockUser.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("toggle_active", () => {
    it("should toggle user active status", async () => {
      const toggledUser = { ...mockUser, isActive: false };
      (db.query.usersTable.findFirst as vi.Mock).mockResolvedValue(mockUser); // Current state is active
      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([toggledUser]),
      });

      const result = await toggle_active(mockUser.id, mockBusinessId);
      expect(result).toEqual({ data: toggledUser, error: null });
      expect(db.update).toHaveBeenCalledWith(usersTable);
      expect(db.update().set).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        })
      );
    });

    it("should return MISSING_INPUT if userId or businessId is missing", async () => {
      let result = await toggle_active("", mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await toggle_active(mockUser.id, "");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return error from get_by_id if user not found", async () => {
      (db.query.usersTable.findFirst as vi.Mock).mockResolvedValue(undefined);

      const result = await toggle_active(mockUser.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.USER_NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.usersTable.findFirst as vi.Mock).mockResolvedValue(mockUser);
      (db.update as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await toggle_active(mockUser.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
