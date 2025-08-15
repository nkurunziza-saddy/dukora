import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { schedulesTable } from "@/lib/schema/models/schedules";
import { eq, desc, and } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import {
  get_all,
  get_overview,
  get_by_id,
  create,
  update,
  remove,
  create_many,
} from "@/server/repos/schedules-repo";

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
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    select: vi.fn(() => {
      const mockQueryBuilder = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      };
      return mockQueryBuilder;
    }),
    query: {
      schedulesTable: {
        findFirst: vi.fn(),
      },
    },
  },
}));

describe("Schedules Repo", () => {
  const mockBusinessId = "biz1";
  const mockUserId = "user1";
  const mockSchedule = {
    id: "sched1",
    title: "Test Schedule",
    businessId: mockBusinessId,
    userId: mockUserId,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get_all", () => {
    it("should return all schedules for a business and user", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([mockSchedule]),
      });

      const result = await get_all(mockBusinessId, mockUserId);
      expect(result).toEqual({ data: [mockSchedule], error: null });
      expect(db.select).toHaveBeenCalledWith();
      expect(db.select().from).toHaveBeenCalledWith(schedulesTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        and(
          eq(schedulesTable.businessId, mockBusinessId),
          eq(schedulesTable.userId, mockUserId)
        )
      );
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await get_all("", mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_all(mockBusinessId, mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_overview", () => {
    it("should return schedule overview with limit", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSchedule]),
      });

      const result = await get_overview(mockBusinessId, mockUserId, 5);
      expect(result).toEqual({ data: [mockSchedule], error: null });
      expect(db.select().from().where().orderBy().limit).toHaveBeenCalledWith(
        5
      );
    });

    it("should return schedule overview without limit (default 5)", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSchedule]),
      });

      const result = await get_overview(mockBusinessId, mockUserId);
      expect(result).toEqual({ data: [mockSchedule], error: null });
      expect(db.select().from().where().orderBy().limit).toHaveBeenCalledWith(
        5
      );
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await get_overview("", mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await get_overview(mockBusinessId, mockUserId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("get_by_id", () => {
    it("should return a schedule by ID", async () => {
      (db.query.schedulesTable.findFirst as vi.Mock).mockResolvedValue(
        mockSchedule
      );

      const result = await get_by_id(mockSchedule.id, mockBusinessId);
      expect(result).toEqual({ data: mockSchedule, error: null });
      expect(db.query.schedulesTable.findFirst).toHaveBeenCalledWith({
        where: and(
          eq(schedulesTable.id, mockSchedule.id),
          eq(schedulesTable.businessId, mockBusinessId)
        ),
      });
    });

    it("should return MISSING_INPUT if scheduleId or businessId is missing", async () => {
      let result = await get_by_id("", mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await get_by_id(mockSchedule.id, "");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return NOT_FOUND if schedule is not found", async () => {
      (db.query.schedulesTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );

      const result = await get_by_id(mockSchedule.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.schedulesTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await get_by_id(mockSchedule.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create", () => {
    it("should create a new schedule", async () => {
      const newScheduleData = {
        title: "New Schedule",
        businessId: mockBusinessId,
        userId: mockUserId,
      };
      const createdSchedule = { id: "newSched", ...newScheduleData };

      (db.insert as vi.Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdSchedule]),
      });

      const result = await create(mockBusinessId, mockUserId, newScheduleData);
      expect(result).toEqual({ data: createdSchedule, error: null });
      expect(db.insert).toHaveBeenCalledWith(schedulesTable);
      expect(db.insert().values).toHaveBeenCalledWith(newScheduleData);
    });

    it("should return MISSING_INPUT if schedule title or businessId is missing", async () => {
      let result = await create(mockBusinessId, mockUserId, {
        title: "",
        businessId: mockBusinessId,
        userId: mockUserId,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create(mockBusinessId, mockUserId, {
        title: "New Schedule",
        businessId: "",
        userId: mockUserId,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await create(mockBusinessId, mockUserId, {
        title: "New Schedule",
        businessId: mockBusinessId,
        userId: mockUserId,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("update", () => {
    it("should update an existing schedule", async () => {
      const updates = { title: "Updated Schedule Title" };
      const updatedSchedule = { ...mockSchedule, ...updates };

      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedSchedule]),
      });

      const result = await update(
        mockSchedule.id,
        mockBusinessId,
        mockUserId,
        updates
      );
      expect(result).toEqual({ data: updatedSchedule, error: null });
      expect(db.update).toHaveBeenCalledWith(schedulesTable);
      expect(db.update().set).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(Date),
      });
    });

    it("should return MISSING_INPUT if scheduleId or businessId is missing", async () => {
      let result = await update("", mockBusinessId, mockUserId, {});
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await update(mockSchedule.id, "", mockUserId, {});
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return NOT_FOUND if schedule to update is not found", async () => {
      (db.update as vi.Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      });

      const result = await update(
        mockSchedule.id,
        mockBusinessId,
        mockUserId,
        {}
      );
      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.update as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await update(
        mockSchedule.id,
        mockBusinessId,
        mockUserId,
        {}
      );
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("remove", () => {
    it("should delete a schedule", async () => {
      (db.query.schedulesTable.findFirst as vi.Mock).mockResolvedValue(
        mockSchedule
      );
      (db.delete as vi.Mock).mockReturnValue({
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockSchedule]),
      });

      const result = await remove(mockSchedule.id, mockBusinessId);
      expect(result).toEqual({ data: mockSchedule, error: null });
      expect(db.delete).toHaveBeenCalledWith(schedulesTable);
      expect(db.delete().where).toHaveBeenCalledWith(
        and(
          eq(schedulesTable.id, mockSchedule.id),
          eq(schedulesTable.businessId, mockBusinessId)
        )
      );
    });

    it("should return MISSING_INPUT if scheduleId or businessId is missing", async () => {
      let result = await remove("", mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await remove(mockSchedule.id, "");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return NOT_FOUND if schedule to delete is not found", async () => {
      (db.query.schedulesTable.findFirst as vi.Mock).mockResolvedValue(
        undefined
      );

      const result = await remove(mockSchedule.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.query.schedulesTable.findFirst as vi.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const result = await remove(mockSchedule.id, mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });

  describe("create_many", () => {
    it("should create multiple schedules", async () => {
      const newSchedulesData = [
        { title: "Sched A", businessId: mockBusinessId, userId: mockUserId },
        { title: "Sched B", businessId: mockBusinessId, userId: mockUserId },
      ];
      (db.insert as vi.Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(newSchedulesData),
      });

      const result = await create_many(newSchedulesData);
      expect(result).toEqual({ data: newSchedulesData, error: null });
      expect(db.insert).toHaveBeenCalledWith(schedulesTable);
      expect(db.insert().values).toHaveBeenCalledWith(newSchedulesData);
    });

    it("should return MISSING_INPUT if schedules array is empty", async () => {
      const result = await create_many([]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return MISSING_INPUT if businessId is inconsistent or missing", async () => {
      let result = await create_many([
        { title: "Sched A", businessId: "", userId: mockUserId },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await create_many([
        { title: "Sched A", businessId: mockBusinessId, userId: mockUserId },
        { title: "Sched B", businessId: "anotherBiz", userId: mockUserId },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.insert as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await create_many([
        { title: "Sched A", businessId: mockBusinessId, userId: mockUserId },
      ]);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
