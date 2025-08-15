import { NextRequest, NextResponse } from "next/server";
import * as supplierService from "@/server/actions/supplier-actions";
import { ErrorCode } from "@/server/constants/errors";

export async function GET() {
  try {
    const suppliers = await supplierService.getSuppliers({});
    if (suppliers.error) {
      return NextResponse.json(suppliers.error, { status: 500 });
    }
    return NextResponse.json(suppliers.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supplier = await request.json();
    const newSupplier = await supplierService.createSupplier(supplier);
    if (newSupplier.error) {
      return NextResponse.json(newSupplier.error, { status: 500 });
    }
    return NextResponse.json(newSupplier);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supplier, supplierId } = await request.json();
    const updatedSupplier = await supplierService.updateSupplier({
      supplierId: supplierId,
      updates: supplier,
    });
    if (updatedSupplier.error) {
      return NextResponse.json(updatedSupplier.error, { status: 500 });
    }
    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await supplierService.deleteSupplier(id);
    if (r.error) {
      return NextResponse.json(r.error, { status: 500 });
    }
    return NextResponse.json(r.data);
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}
