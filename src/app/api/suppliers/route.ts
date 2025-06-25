import { NextRequest, NextResponse } from "next/server";
import * as supplierService from "@/server/actions/supplier-actions";

export async function GET() {
  try {
    const suppliers = await supplierService.getSuppliers();
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to get suppliers", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supplier = await request.json();
    const newSupplier = await supplierService.createSupplier(supplier);
    return NextResponse.json(newSupplier);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to create supplier", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supplier, supplierId } = await request.json();
    const updatedSupplier = await supplierService.updateSupplier(
      supplierId,
      supplier
    );
    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to update supplier", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await supplierService.deleteSupplier(id);
    return NextResponse.json(r);
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json("Failed to delete supplier", { status: 500 });
  }
}
