import { getProductById } from "@/server/actions/product-actions";
import { ErrorCode } from "@/server/constants/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const productDetails = await getProductById((await params).productId);
    if (productDetails.error) {
      return NextResponse.json(productDetails.error, { status: 500 });
    }
    return NextResponse.json(productDetails.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, {
      status: 500,
    });
  }
}
