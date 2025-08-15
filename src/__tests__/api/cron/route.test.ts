import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock process.env.CRON_SECRET
const MOCK_CRON_SECRET = "test_cron_secret";
vi.stubEnv("CRON_SECRET", MOCK_CRON_SECRET);

// Import the handler after mocking
import { GET } from "@/app/api/cron/route";
import { ErrorCode } from "@/server/constants/errors";

describe("Cron API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/cron", () => {
    it("should return 200 if Authorization header matches CRON_SECRET", async () => {
      const request = new NextRequest("http://localhost/api/cron", {
        headers: {
          Authorization: `Bearer ${MOCK_CRON_SECRET}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ok: true });
    });

    it("should return 401 if Authorization header is missing", async () => {
      const request = new NextRequest("http://localhost/api/cron");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toBe(ErrorCode.UNAUTHORIZED);
    });

    it("should return 401 if Authorization header is invalid", async () => {
      const request = new NextRequest("http://localhost/api/cron", {
        headers: {
          Authorization: "Bearer invalid_secret",
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toBe(ErrorCode.UNAUTHORIZED);
    });

    it("should return 401 if Authorization header format is incorrect", async () => {
      const request = new NextRequest("http://localhost/api/cron", {
        headers: {
          Authorization: MOCK_CRON_SECRET,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toBe(ErrorCode.UNAUTHORIZED);
    });
  });
});
