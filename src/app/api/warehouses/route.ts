import { NextRequest, NextResponse } from "next/server";
import * as warehouseService from "@/server/actions/warehouse-actions";

export async function GET() {
  try {
    const warehouses = await warehouseService.getWarehouses({});
    return NextResponse.json(warehouses.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to get warehouses", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const warehouse = await request.json();
    const newWarehouse = await warehouseService.createWarehouse(warehouse);
    return NextResponse.json(newWarehouse);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to create warehouse", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { warehouse, warehouseId } = await request.json();
    const updatedWarehouse = await warehouseService.updateWarehouse({
      warehouseId,
      updates: warehouse,
    });
    return NextResponse.json(updatedWarehouse);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to update warehouse", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await warehouseService.deleteWarehouse(id);
    return NextResponse.json(r);
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json("Failed to delete warehouse", { status: 500 });
  }
}
