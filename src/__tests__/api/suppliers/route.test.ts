import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import * as supplierService from "@/server/actions/supplier-actions";

// Mock the supplierService module
vi.mock("@/server/actions/supplier-actions", () => ({
  getSuppliers: vi.fn(),
  createSupplier: vi.fn(),
  updateSupplier: vi.fn(),
  deleteSupplier: vi.fn(),
}));

// Import the handlers after mocking
import { GET, POST, PUT, DELETE } from "@/app/api/suppliers/route";
import { ErrorCode } from "@/server/constants/errors";

describe("Supplier API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/suppliers", () => {
    it("should return suppliers with status 200", async () => {
      const mockSuppliers = [{ id: "1", name: "Supplier A" }];
      (supplierService.getSuppliers as vi.Mock).mockResolvedValue({
        data: mockSuppliers,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSuppliers);
      expect(supplierService.getSuppliers).toHaveBeenCalled();
    });

    it("should return 500 if getSuppliers fails", async () => {
      (supplierService.getSuppliers as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(supplierService.getSuppliers).toHaveBeenCalled();
    });
  });

  describe("POST /api/suppliers", () => {
    it("should create a supplier with status 200", async () => {
      const newSupplierData = { name: "New Supplier" };
      const mockNewSupplier = { id: "2", name: "New Supplier" };
      (supplierService.createSupplier as vi.Mock).mockResolvedValue({
        data: mockNewSupplier,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplierData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockNewSupplier, error: null });
      expect(supplierService.createSupplier).toHaveBeenCalledWith(
        newSupplierData
      );
    });

    it("should return 500 if createSupplier fails", async () => {
      const newSupplierData = { name: "New Supplier" };
      (supplierService.createSupplier as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplierData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(supplierService.createSupplier).toHaveBeenCalledWith(
        newSupplierData
      );
    });
  });

  describe("PUT /api/suppliers", () => {
    it("should update a supplier with status 200", async () => {
      const updateData = {
        supplierId: "1",
        supplier: { name: "Updated Supplier" },
      };
      const mockUpdatedSupplier = { id: "1", name: "Updated Supplier" };
      (supplierService.updateSupplier as vi.Mock).mockResolvedValue({
        data: mockUpdatedSupplier,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/suppliers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockUpdatedSupplier, error: null });
      expect(supplierService.updateSupplier).toHaveBeenCalledWith({
        supplierId: updateData.supplierId,
        updates: updateData.supplier,
      });
    });

    it("should return 500 if updateSupplier fails", async () => {
      const updateData = {
        supplierId: "1",
        supplier: { name: "Updated Supplier" },
      };
      (supplierService.updateSupplier as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/suppliers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(supplierService.updateSupplier).toHaveBeenCalledWith({
        supplierId: updateData.supplierId,
        updates: updateData.supplier,
      });
    });
  });

  describe("DELETE /api/suppliers", () => {
    it("should delete a supplier with status 200", async () => {
      const deleteData = { id: "1" };
      (supplierService.deleteSupplier as vi.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const request = new NextRequest("http://localhost/api/suppliers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(supplierService.deleteSupplier).toHaveBeenCalledWith(
        deleteData.id
      );
    });

    it("should return 500 if deleteSupplier fails", async () => {
      const deleteData = { id: "1" };
      (supplierService.deleteSupplier as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/suppliers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(supplierService.deleteSupplier).toHaveBeenCalledWith(
        deleteData.id
      );
    });
  });
});
