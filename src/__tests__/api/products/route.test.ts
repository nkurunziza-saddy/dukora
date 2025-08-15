import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import * as productService from "@/server/actions/product-actions";

// Mock the productService module
vi.mock("@/server/actions/product-actions", () => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

// Import the handlers after mocking
import { GET, POST, PUT, DELETE } from "@/app/api/products/route";
import { ErrorCode } from "@/server/constants/errors";

describe("Product API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("should return products with status 200", async () => {
      const mockProducts = [{ id: "1", name: "Product A" }];
      (productService.getProducts as vi.Mock).mockResolvedValue({
        data: mockProducts,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProducts);
      expect(productService.getProducts).toHaveBeenCalled();
    });

    it("should return 500 if getProducts fails", async () => {
      (productService.getProducts as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(productService.getProducts).toHaveBeenCalled();
    });
  });

  describe("POST /api/products", () => {
    it("should create a product with status 200", async () => {
      const newProductData = { name: "New Product" };
      const mockNewProduct = { id: "2", name: "New Product" };
      (productService.createProduct as vi.Mock).mockResolvedValue({
        data: mockNewProduct,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProductData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockNewProduct, error: null });
      expect(productService.createProduct).toHaveBeenCalledWith(newProductData);
    });

    it("should return 500 if createProduct fails", async () => {
      const newProductData = { name: "New Product" };
      (productService.createProduct as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProductData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(productService.createProduct).toHaveBeenCalledWith(newProductData);
    });
  });

  describe("PUT /api/products", () => {
    it("should update a product with status 200", async () => {
      const updateData = {
        productId: "1",
        product: { name: "Updated Product" },
      };
      const mockUpdatedProduct = { id: "1", name: "Updated Product" };
      (productService.updateProduct as vi.Mock).mockResolvedValue({
        data: mockUpdatedProduct,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockUpdatedProduct, error: null });
      expect(productService.updateProduct).toHaveBeenCalledWith({
        productId: updateData.productId,
        updates: updateData.product,
      });
    });

    it("should return 500 if updateProduct fails", async () => {
      const updateData = {
        productId: "1",
        product: { name: "Updated Product" },
      };
      (productService.updateProduct as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(productService.updateProduct).toHaveBeenCalledWith({
        productId: updateData.productId,
        updates: updateData.product,
      });
    });
  });

  describe("DELETE /api/products", () => {
    it("should delete a product with status 200", async () => {
      const deleteData = { id: "1" };
      (productService.deleteProduct as vi.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const request = new NextRequest("http://localhost/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(productService.deleteProduct).toHaveBeenCalledWith(deleteData.id);
    });

    it("should return 500 if deleteProduct fails", async () => {
      const deleteData = { id: "1" };
      (productService.deleteProduct as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(productService.deleteProduct).toHaveBeenCalledWith(deleteData.id);
    });
  });
});
