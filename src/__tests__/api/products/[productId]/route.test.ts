import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as productActions from "@/server/actions/product-actions";

// Mock the productActions module
vi.mock("@/server/actions/product-actions", () => ({
  getProductById: vi.fn(),
}));

// Import the handler after mocking
import { GET } from "@/app/api/products/[productId]/route";
import { ErrorCode } from "@/server/constants/errors";

describe("Product by ID API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/products/[productId]", () => {
    it("should return product details with status 200", async () => {
      const mockProduct = { id: "123", name: "Test Product" };
      (productActions.getProductById as vi.Mock).mockResolvedValue({
        data: mockProduct,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/products/123");
      const params = { productId: "123" };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProduct);
      expect(productActions.getProductById).toHaveBeenCalledWith("123");
    });

    it("should return 500 if getProductById fails", async () => {
      (productActions.getProductById as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/products/123");
      const params = { productId: "123" };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(productActions.getProductById).toHaveBeenCalledWith("123");
    });
  });
});
