import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as userActions from "@/server/actions/user-actions";

vi.mock("@/server/actions/user-actions", () => ({
  getUserById: vi.fn(),
}));

import { GET } from "@/app/api/users/[userId]/route";
import { ErrorCode } from "@/server/constants/errors";

describe("User by ID API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/users/[userId]", () => {
    it("should return user details with status 200", async () => {
      const mockUser = { id: "123", name: "Test User" };
      (userActions.getUserById as vi.Mock).mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/users/123");
      const params = { userId: "123" };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
      expect(userActions.getUserById).toHaveBeenCalledWith("123");
    });

    it("should return 500 if getUserById fails", async () => {
      (userActions.getUserById as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/users/123");
      const params = { userId: "123" };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(userActions.getUserById).toHaveBeenCalledWith("123");
    });
  });
});
