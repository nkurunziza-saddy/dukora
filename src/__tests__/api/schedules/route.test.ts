import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import * as schedulesService from "@/server/actions/schedule-actions";

// Mock the schedulesService module
vi.mock("@/server/actions/schedule-actions", () => ({
  getSchedules: vi.fn(),
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
}));

// Import the handlers after mocking
import { GET, POST, PUT, DELETE } from "@/app/api/schedules/route";
import { ErrorCode } from "@/server/constants/errors";

describe("Schedule API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/schedules", () => {
    it("should return schedules with status 200", async () => {
      const mockSchedules = [{ id: "1", title: "Meeting" }];
      (schedulesService.getSchedules as vi.Mock).mockResolvedValue({
        data: mockSchedules,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSchedules);
      expect(schedulesService.getSchedules).toHaveBeenCalled();
    });

    it("should return 500 if getSchedules fails", async () => {
      (schedulesService.getSchedules as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(schedulesService.getSchedules).toHaveBeenCalled();
    });
  });

  describe("POST /api/schedules", () => {
    it("should create a schedule with status 200", async () => {
      const newScheduleData = { title: "New Schedule" };
      const mockNewSchedule = { id: "2", title: "New Schedule" };
      (schedulesService.createSchedule as vi.Mock).mockResolvedValue({
        data: mockNewSchedule,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScheduleData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockNewSchedule, error: null });
      expect(schedulesService.createSchedule).toHaveBeenCalledWith(
        newScheduleData
      );
    });

    it("should return 500 if createSchedule fails", async () => {
      const newScheduleData = { title: "New Schedule" };
      (schedulesService.createSchedule as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScheduleData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(schedulesService.createSchedule).toHaveBeenCalledWith(
        newScheduleData
      );
    });
  });

  describe("PUT /api/schedules", () => {
    it("should update a schedule with status 200", async () => {
      const updateData = {
        schedulesId: "1",
        schedules: { title: "Updated Schedule" },
      };
      const mockUpdatedSchedule = { id: "1", title: "Updated Schedule" };
      (schedulesService.updateSchedule as vi.Mock).mockResolvedValue({
        data: mockUpdatedSchedule,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/schedules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockUpdatedSchedule, error: null });
      expect(schedulesService.updateSchedule).toHaveBeenCalledWith({
        scheduleId: updateData.schedulesId,
        updates: updateData.schedules,
      });
    });

    it("should return 500 if updateSchedule fails", async () => {
      const updateData = {
        schedulesId: "1",
        schedules: { title: "Updated Schedule" },
      };
      (schedulesService.updateSchedule as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/schedules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(schedulesService.updateSchedule).toHaveBeenCalledWith({
        scheduleId: updateData.schedulesId,
        updates: updateData.schedules,
      });
    });
  });

  describe("DELETE /api/schedules", () => {
    it("should delete a schedule with status 200", async () => {
      const deleteData = { id: "1" };
      (schedulesService.deleteSchedule as vi.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const request = new NextRequest("http://localhost/api/schedules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(schedulesService.deleteSchedule).toHaveBeenCalledWith(
        deleteData.id
      );
    });

    it("should return 500 if deleteSchedule fails", async () => {
      const deleteData = { id: "1" };
      (schedulesService.deleteSchedule as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/schedules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(schedulesService.deleteSchedule).toHaveBeenCalledWith(
        deleteData.id
      );
    });
  });
});
