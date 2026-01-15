import { type NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/server/actions/inventory/products-actions";
import { ERROR_CODE } from "@/server/constants/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const productDetails = await getProductById((await params).productId);
    if (productDetails.error) {
      return NextResponse.json(productDetails.error, { status: 500 });
    }
    return NextResponse.json(productDetails.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ERROR_CODE.DATABASE_ERROR, {
      status: 500,
    });
  }
}
