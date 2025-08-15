
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import * as categoryService from "@/server/actions/category-actions";

// Mock the categoryService module
vi.mock("@/server/actions/category-actions", () => ({
  fetchCategories: vi.fn(),
  upsertCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

// Import the handlers after mocking
import { GET, POST, PUT, DELETE } from "@/app/api/categories/route";

describe("Category API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/categories", () => {
    it("should return categories with status 200", async () => {
      const mockCategories = [{ id: "1", name: "Category A" }];
      (categoryService.fetchCategories as vi.Mock).mockResolvedValue({
        data: mockCategories,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCategories);
      expect(categoryService.fetchCategories).toHaveBeenCalled();
    });

    it("should return 500 if fetchCategories fails", async () => {
      (categoryService.fetchCategories as vi.Mock).mockResolvedValue({
        data: null,
        error: "DATABASE_ERROR",
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe("DATABASE_ERROR");
      expect(categoryService.fetchCategories).toHaveBeenCalled();
    });
  });

  describe("POST /api/categories", () => {
    it("should create a category with status 200", async () => {
      const newCategoryData = { value: "New Category" };
      const mockNewCategory = { id: "2", value: "New Category" };
      (categoryService.upsertCategory as vi.Mock).mockResolvedValue({
        data: mockNewCategory,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategoryData.value),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockNewCategory);
      expect(categoryService.upsertCategory).toHaveBeenCalledWith(newCategoryData.value);
    });

    it("should return 500 if upsertCategory fails", async () => {
      const newCategoryData = { value: "New Category" };
      (categoryService.upsertCategory as vi.Mock).mockResolvedValue({
        data: null,
        error: "DATABASE_ERROR",
      });

      const request = new NextRequest("http://localhost/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategoryData.value),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe("DATABASE_ERROR");
      expect(categoryService.upsertCategory).toHaveBeenCalledWith(newCategoryData.value);
    });
  });

  describe("PUT /api/categories", () => {
    it("should update a category with status 200", async () => {
      const updateData = { categoryId: "1", category: { value: "Updated Category" } };
      const mockUpdatedCategory = { id: "1", value: "Updated Category" };
      (categoryService.updateCategory as vi.Mock).mockResolvedValue({
        data: mockUpdatedCategory,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedCategory);
      expect(categoryService.updateCategory).toHaveBeenCalledWith({
        categoryId: updateData.categoryId,
        updates: updateData.category,
      });
    });

    it("should return 500 if updateCategory fails", async () => {
      const updateData = { categoryId: "1", category: { value: "Updated Category" } };
      (categoryService.updateCategory as vi.Mock).mockResolvedValue({
        data: null,
        error: "DATABASE_ERROR",
      });

      const request = new NextRequest("http://localhost/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe("DATABASE_ERROR");
      expect(categoryService.updateCategory).toHaveBeenCalledWith({
        categoryId: updateData.categoryId,
        updates: updateData.category,
      });
    });
  });

  describe("DELETE /api/categories", () => {
    it("should delete a category with status 200", async () => {
      const deleteData = { id: "1" };
      (categoryService.deleteCategory as vi.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const request = new NextRequest("http://localhost/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(categoryService.deleteCategory).toHaveBeenCalledWith(deleteData.id);
    });

    it("should return 500 if deleteCategory fails", async () => {
      const deleteData = { id: "1" };
      (categoryService.deleteCategory as vi.Mock).mockResolvedValue({
        data: null,
        error: "DATABASE_ERROR",
      });

      const request = new NextRequest("http://localhost/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe("DATABASE_ERROR");
      expect(categoryService.deleteCategory).toHaveBeenCalledWith(deleteData.id);
    });
  });
});
