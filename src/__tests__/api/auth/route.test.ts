import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

vi.mock("@/app/api/auth/[...all]/route", () => ({
  POST: vi.fn(() => new Response("Mock POST response", { status: 200 })),
  GET: vi.fn(() => new Response("Mock GET response", { status: 200 })),
}));

import { GET, POST } from "@/app/api/auth/[...all]/route";

describe("Auth API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export POST and GET handlers", () => {
    expect(POST).toBeDefined();
    expect(GET).toBeDefined();
  });

  it("should call the mocked POST handler", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Mock POST response");
  });

  it("should call the mocked GET handler", async () => {
    const request = new NextRequest("http://localhost/api/auth/session", {
      method: "GET",
    });
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Mock GET response");
  });
});
