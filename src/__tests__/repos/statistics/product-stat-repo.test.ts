import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { productsTable } from "@/lib/schema";
import { count, eq } from "drizzle-orm";
import { ErrorCode } from "@/server/constants/errors";

import { getTotalProducts } from "@/server/repos/statistics/product-stat-repo";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

describe("Product Statistics Repo", () => {
  const mockBusinessId = "biz1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTotalProducts", () => {
    it("should return the total count of products for a business", async () => {
      (db.select as vi.Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 5 }]),
      });

      const result = await getTotalProducts(mockBusinessId);
      expect(result).toEqual({ data: 5, error: null });
      expect(db.select).toHaveBeenCalledWith({ count: count(productsTable) });
      expect(db.select().from).toHaveBeenCalledWith(productsTable);
      expect(db.select().from().where).toHaveBeenCalledWith(
        eq(productsTable.businessId, mockBusinessId)
      );
    });

    it("should return MISSING_INPUT if businessId is missing", async () => {
      const result = await getTotalProducts("");
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return FAILED_REQUEST on database error", async () => {
      (db.select as vi.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      const result = await getTotalProducts(mockBusinessId);
      expect(result).toEqual({ data: null, error: ErrorCode.FAILED_REQUEST });
    });
  });
});
