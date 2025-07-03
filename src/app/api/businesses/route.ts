import { NextRequest, NextResponse } from "next/server";
import * as businessService from "@/server/actions/business-actions";

export async function GET() {
  try {
    const businesses = await businessService.getBusinesses({});
    return NextResponse.json(businesses.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to get businesses", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const business = await request.json();
    const newBusiness = await businessService.createBusiness(business);
    return NextResponse.json(newBusiness);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to create business", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { business, businessId } = await request.json();
    const updatedBusiness = await businessService.updateBusiness({
      businessId: businessId,
      updates: business,
    });
    return NextResponse.json(updatedBusiness);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to update business", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await businessService.deleteBusiness(id);
    return NextResponse.json(r);
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json("Failed to delete business", { status: 500 });
  }
}
