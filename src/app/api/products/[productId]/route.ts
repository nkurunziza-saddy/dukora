import { getProductById } from "@/server/actions/product-actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const productDetails = await getProductById((await params).productId);
    return NextResponse.json(productDetails.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to fetch product details", {
      status: 500,
    });
  }
}
