
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import * as businessService from "@/server/actions/business-actions";

// Mock the businessService module
vi.mock("@/server/actions/business-actions", () => ({
  getBusinesses: vi.fn(),
  createBusiness: vi.fn(),
  updateBusiness: vi.fn(),
  deleteBusiness: vi.fn(),
}));

// Import the handlers after mocking
import { GET, POST, PUT, DELETE } from "@/app/api/businesses/route";

describe("Business API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/businesses", () => {
    it("should return businesses with status 200", async () => {
      const mockBusinesses = [{ id: "1", name: "Business A" }];
      (businessService.getBusinesses as vi.Mock).mockResolvedValue({
        data: mockBusinesses,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockBusinesses);
      expect(businessService.getBusinesses).toHaveBeenCalled();
    });

    it("should return 500 if getBusinesses fails", async () => {
      (businessService.getBusinesses as vi.Mock).mockResolvedValue({
        data: null,
        error: "DATABASE_ERROR",
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe("DATABASE_ERROR");
      expect(businessService.getBusinesses).toHaveBeenCalled();
    });
  });

  describe("POST /api/businesses", () => {
    it("should create a business with status 200", async () => {
      const newBusinessData = { name: "New Business" };
      const mockNewBusiness = { id: "2", name: "New Business" };
      (businessService.createBusiness as vi.Mock).mockResolvedValue({
        data: mockNewBusiness,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBusinessData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockNewBusiness, error: null });
      expect(businessService.createBusiness).toHaveBeenCalledWith(newBusinessData);
    });

    it("should return 500 if createBusiness fails", async () => {
      const newBusinessData = { name: "New Business" };
      (businessService.createBusiness as vi.Mock).mockResolvedValue({
        data: null,
        error: "DATABASE_ERROR",
      });

      const request = new NextRequest("http://localhost/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBusinessData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe("DATABASE_ERROR");
      expect(businessService.createBusiness).toHaveBeenCalledWith(newBusinessData);
    });
  });

  describe("PUT /api/businesses", () => {
    it("should update a business with status 200", async () => {
      const updateData = { businessId: "1", business: { name: "Updated Business" } };
      const mockUpdatedBusiness = { id: "1", name: "Updated Business" };
      (businessService.updateBusiness as vi.Mock).mockResolvedValue({
        data: mockUpdatedBusiness,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/businesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockUpdatedBusiness, error: null });
      expect(businessService.updateBusiness).toHaveBeenCalledWith({
        businessId: updateData.businessId,
        updates: updateData.business,
      });
    });

    it("should return 500 if updateBusiness fails", async () => {
      const updateData = { businessId: "1", business: { name: "Updated Business" } };
      (businessService.updateBusiness as vi.Mock).mockResolvedValue({
        data: null,
        error: "DATABASE_ERROR",
      });

      const request = new NextRequest("http://localhost/api/businesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe("DATABASE_ERROR");
      expect(businessService.updateBusiness).toHaveBeenCalledWith({
        businessId: updateData.businessId,
        updates: updateData.business,
      });
    });
  });

  describe("DELETE /api/businesses", () => {
    it("should delete a business with status 200", async () => {
      const deleteData = { id: "1" };
      (businessService.deleteBusiness as vi.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const request = new NextRequest("http://localhost/api/businesses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { success: true }, error: null });
      expect(businessService.deleteBusiness).toHaveBeenCalledWith(deleteData.id);
    });

    it("should return 500 if deleteBusiness fails", async () => {
      const deleteData = { id: "1" };
      (businessService.deleteBusiness as vi.Mock).mockResolvedValue({
        data: null,
        error: "DATABASE_ERROR",
      });

      const request = new NextRequest("http://localhost/api/businesses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe("DATABASE_ERROR");
      expect(businessService.deleteBusiness).toHaveBeenCalledWith(deleteData.id);
    });
  });
});
