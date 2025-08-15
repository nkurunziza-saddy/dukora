import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe("auth-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentSession", () => {
    it("should return the current session if available", async () => {
      const mockSession = { user: { id: "123", email: "test@example.com" } };
      (auth.api.getSession as vi.Mock).mockResolvedValue(mockSession);

      const session = await getCurrentSession();

      expect(headers).toHaveBeenCalled();
      expect(auth.api.getSession).toHaveBeenCalledWith({
        headers: expect.any(Object),
      });
      expect(session).toEqual(mockSession);
    });

    it("should return null if no session is available", async () => {
      (auth.api.getSession as vi.Mock).mockResolvedValue(null);

      const session = await getCurrentSession();

      expect(headers).toHaveBeenCalled();
      expect(auth.api.getSession).toHaveBeenCalledWith({
        headers: expect.any(Object),
      });
      expect(session).toBeNull();
    });

    it("should handle errors from getSession gracefully", async () => {
      const mockError = new Error("Failed to get session");
      (auth.api.getSession as vi.Mock).mockRejectedValue(mockError);

      // The current implementation of getCurrentSession does not catch errors from auth.api.getSession.
      // It re-throws them. So, we expect the function call to throw.
      await expect(getCurrentSession()).rejects.toThrow(mockError);

      expect(headers).toHaveBeenCalled();
      expect(auth.api.getSession).toHaveBeenCalledWith({
        headers: expect.any(Object),
      });
    });
  });
});
