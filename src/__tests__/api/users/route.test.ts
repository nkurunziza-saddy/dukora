import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import * as userService from "@/server/actions/user-actions";

// Mock the userService module
vi.mock("@/server/actions/user-actions", () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

// Import the handlers after mocking
import { GET, POST, PUT, DELETE } from "@/app/api/users/route";
import { ErrorCode } from "@/server/constants/errors";

describe("User API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/users", () => {
    it("should return users with status 200", async () => {
      const mockUsers = [{ id: "1", name: "User A" }];
      (userService.getUsers as vi.Mock).mockResolvedValue({
        data: mockUsers,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUsers);
      expect(userService.getUsers).toHaveBeenCalled();
    });

    it("should return 500 if getUsers fails", async () => {
      (userService.getUsers as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(userService.getUsers).toHaveBeenCalled();
    });
  });

  describe("POST /api/users", () => {
    it("should create a user with status 200", async () => {
      const newUserData = { name: "New User" };
      const mockNewUser = { id: "2", name: "New User" };
      (userService.createUser as vi.Mock).mockResolvedValue({
        data: mockNewUser,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockNewUser, error: null });
      expect(userService.createUser).toHaveBeenCalledWith(newUserData);
    });

    it("should return 500 if createUser fails", async () => {
      const newUserData = { name: "New User" };
      (userService.createUser as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(userService.createUser).toHaveBeenCalledWith(newUserData);
    });
  });

  describe("PUT /api/users", () => {
    it("should update a user with status 200", async () => {
      const updateData = { userId: "1", user: { name: "Updated User" } };
      const mockUpdatedUser = { id: "1", name: "Updated User" };
      (userService.updateUser as vi.Mock).mockResolvedValue({
        data: mockUpdatedUser,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockUpdatedUser, error: null });
      expect(userService.updateUser).toHaveBeenCalledWith({
        userId: updateData.userId,
        userData: updateData.user,
      });
    });

    it("should return 500 if updateUser fails", async () => {
      const updateData = { userId: "1", user: { name: "Updated User" } };
      (userService.updateUser as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(userService.updateUser).toHaveBeenCalledWith({
        userId: updateData.userId,
        userData: updateData.user,
      });
    });
  });

  describe("DELETE /api/users", () => {
    it("should delete a user with status 200", async () => {
      const deleteData = { id: "1" };
      (userService.deleteUser as vi.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const request = new NextRequest("http://localhost/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(userService.deleteUser).toHaveBeenCalledWith(deleteData.id);
    });

    it("should return 500 if deleteUser fails", async () => {
      const deleteData = { id: "1" };
      (userService.deleteUser as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(userService.deleteUser).toHaveBeenCalledWith(deleteData.id);
    });
  });
});
