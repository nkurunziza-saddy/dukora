import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import * as warehouseService from "@/server/actions/warehouse-actions";

// Mock the warehouseService module
vi.mock("@/server/actions/warehouse-actions", () => ({
  getWarehouses: vi.fn(),
  createWarehouse: vi.fn(),
  updateWarehouse: vi.fn(),
  deleteWarehouse: vi.fn(),
}));

// Import the handlers after mocking
import { GET, POST, PUT, DELETE } from "@/app/api/warehouses/route";
import { ErrorCode } from "@/server/constants/errors";

describe("Warehouse API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/warehouses", () => {
    it("should return warehouses with status 200", async () => {
      const mockWarehouses = [{ id: "1", name: "Warehouse A" }];
      (warehouseService.getWarehouses as vi.Mock).mockResolvedValue({
        data: mockWarehouses,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockWarehouses);
      expect(warehouseService.getWarehouses).toHaveBeenCalled();
    });

    it("should return 500 if getWarehouses fails", async () => {
      (warehouseService.getWarehouses as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(warehouseService.getWarehouses).toHaveBeenCalled();
    });
  });

  describe("POST /api/warehouses", () => {
    it("should create a warehouse with status 200", async () => {
      const newWarehouseData = { name: "New Warehouse" };
      const mockNewWarehouse = { id: "2", name: "New Warehouse" };
      (warehouseService.createWarehouse as vi.Mock).mockResolvedValue({
        data: mockNewWarehouse,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWarehouseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockNewWarehouse, error: null });
      expect(warehouseService.createWarehouse).toHaveBeenCalledWith(
        newWarehouseData
      );
    });

    it("should return 500 if createWarehouse fails", async () => {
      const newWarehouseData = { name: "New Warehouse" };
      (warehouseService.createWarehouse as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWarehouseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(warehouseService.createWarehouse).toHaveBeenCalledWith(
        newWarehouseData
      );
    });
  });

  describe("PUT /api/warehouses", () => {
    it("should update a warehouse with status 200", async () => {
      const updateData = {
        warehouseId: "1",
        warehouse: { name: "Updated Warehouse" },
      };
      const mockUpdatedWarehouse = { id: "1", name: "Updated Warehouse" };
      (warehouseService.updateWarehouse as vi.Mock).mockResolvedValue({
        data: mockUpdatedWarehouse,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/warehouses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockUpdatedWarehouse, error: null });
      expect(warehouseService.updateWarehouse).toHaveBeenCalledWith({
        warehouseId: updateData.warehouseId,
        updates: updateData.warehouse,
      });
    });

    it("should return 500 if updateWarehouse fails", async () => {
      const updateData = {
        warehouseId: "1",
        warehouse: { name: "Updated Warehouse" },
      };
      (warehouseService.updateWarehouse as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/warehouses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(warehouseService.updateWarehouse).toHaveBeenCalledWith({
        warehouseId: updateData.warehouseId,
        updates: updateData.warehouse,
      });
    });
  });

  describe("DELETE /api/warehouses", () => {
    it("should delete a warehouse with status 200", async () => {
      const deleteData = { id: "1" };
      (warehouseService.deleteWarehouse as vi.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const request = new NextRequest("http://localhost/api/warehouses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { success: true }, error: null });
      expect(warehouseService.deleteWarehouse).toHaveBeenCalledWith(
        deleteData.id
      );
    });

    it("should return 500 if deleteWarehouse fails", async () => {
      const deleteData = { id: "1" };
      (warehouseService.deleteWarehouse as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const request = new NextRequest("http://localhost/api/warehouses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toBe(ErrorCode.DATABASE_ERROR);
      expect(warehouseService.deleteWarehouse).toHaveBeenCalledWith(
        deleteData.id
      );
    });
  });
});
