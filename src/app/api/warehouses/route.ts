import { NextRequest, NextResponse } from "next/server";
import * as warehouseService from "@/server/actions/warehouse-actions";
import { ErrorCode } from "@/server/constants/errors";

export async function GET() {
  try {
    const warehouses = await warehouseService.getWarehouses({});
    if (warehouses.error) {
      return NextResponse.json(warehouses.error, { status: 500 });
    }
    return NextResponse.json(warehouses.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const warehouse = await request.json();
    const newWarehouse = await warehouseService.createWarehouse(warehouse);
    if (newWarehouse.error) {
      return NextResponse.json(newWarehouse.error, { status: 500 });
    }
    return NextResponse.json(newWarehouse);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { warehouse, warehouseId } = await request.json();
    const updatedWarehouse = await warehouseService.updateWarehouse({
      warehouseId,
      updates: warehouse,
    });
    if (updatedWarehouse.error) {
      return NextResponse.json(updatedWarehouse.error, { status: 500 });
    }
    return NextResponse.json(updatedWarehouse);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await warehouseService.deleteWarehouse(id);
    if (r.error) {
      return NextResponse.json(r.error, { status: 500 });
    }
    return NextResponse.json(r);
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}
